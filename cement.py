#!/usr/bin/env python3


import asyncio
import logging
import time
import json
from collections import defaultdict

from aiofile import async_open
import tornado
from tornado import websocket
from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)

def grouper(iterable, n):
    return zip(*([iter(iterable)]*n))

def song_to_deltas(notes, bpm=60):
    bars = notes.split()
    dts = []
    bps = bpm/60
    for notes in bars:
        for i, note in enumerate(notes[::3]):
            dts.append(4/int(note))
    return dts

def song_to_pitches(notes):
    bars = notes.split()
    pitches = []
    for bar in bars:
        notes = grouper(bar, 3)
        for note in notes:
            _, *pitch = note
            pitches.append("".join(pitch))
    return pitches


class Application(tornado.web.Application):
    def __init__(self, **kwargs):
        handlers = [
            (r"/chatsocket", ChatSocketHandler),
            (r"/songs", SongsHandler),
        ]
        settings = dict(
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            xsrf_cookies=True,
        )
        super().__init__(handlers, **kwargs, **settings)


class ChatSocketHandler(websocket.WebSocketHandler):
    rooms = dict()
    waiters = defaultdict(set)
    history = []
    choices = []
    history_size = 200
    test_period = 1
    start_count = defaultdict(int)
    scores = defaultdict(dict)
    t0 = None
    total_err = 0
    id = None

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    def check_origin(self, origin):
        # XXX
        return True

    def open(self):
        self.errs = list()
        print("open")
        room_id = self.request.query_arguments["roomId"][0].decode()
        ChatSocketHandler.waiters[room_id].add(self)

    def on_close(self):
        print("end")
        
        ChatSocketHandler.choices = []
        room_id = self.request.query_arguments["roomId"][0].decode()
        ChatSocketHandler.start_count[room_id] = 0
        ChatSocketHandler.waiters[room_id].remove(self)
        try:
            del ChatSocketHandler.scores[room_id]
        except KeyError:
            pass

    async def load_song(self, needle, file):
        async for line in file:
            haystack, song = line.split('|')
            if needle == haystack:
                return song


    @classmethod
    def update_history(cls, chat):
        cls.history.append(chat)
        if len(cls.history) > cls.history_size:
            cls.history = cls.history[-cls.history_size :]

    @classmethod
    def send_updates(cls, message, room_id):
        logging.info(
            "sending message type %s to %d waiters",
            str(message),
            len(cls.waiters[room_id]),
        )

        for waiter in cls.waiters[room_id]:
            try:
                waiter.write_message(message)
            except:
                logging.error("Error sending message", exc_info=True)



    async def on_message(self, message):
        message = tornado.escape.json_decode(message)
        type_ = message["type"]
        room_id = message["room_id"]
        if type_ == "join":
            self.id = message["id"]
            try:
                ChatSocketHandler.rooms[room_id]["players"].append(self.id)
            except KeyError:
                ChatSocketHandler.rooms[room_id] = {
                   "players": [self.id],
                }
            ChatSocketHandler.send_updates(message, room_id)
            ChatSocketHandler.send_updates(json.dumps({"type": "ready"}), room_id)
        if type_ == "start":
             #assumes 60 bpm
            ChatSocketHandler.choices.append(message["song"])
            async def f():
                ChatSocketHandler.start_count[room_id] += 1
                ids = [w.id for w in self.waiters[room_id] if w.id]
                if len(ids) == ChatSocketHandler.start_count[room_id]:
                    song_name = ChatSocketHandler.choices[0]
                    async with async_open("songs", "r") as f:
                        song = await self.load_song(song_name, f)
                    dts = song_to_deltas(song)
                    pitches = song_to_pitches(song)
                    for w in self.waiters[room_id]:
                        w.t0 = time.time() - self.test_period + 4
                    for _ in range(4):
                        ChatSocketHandler.send_updates(
                            json.dumps({"type": "count"}), room_id
                        )
                        await asyncio.sleep(1)
                    for i, delta in enumerate(dts):
                        if pitches[i] != '--':
                            if i > 0:
                                self.test_period = dts[i-1]
                            ChatSocketHandler.send_updates(
                                json.dumps({"type": "snote", "pitch": pitches[i], "duration": dts[i]}),
                                room_id
                            )
                        await asyncio.sleep(delta)
                        
                    await asyncio.sleep(1)
                    for w in self.waiters[room_id]:
                        ChatSocketHandler.scores[room_id][w.id] = w.total_err
                    ChatSocketHandler.send_updates(
                        json.dumps({"type": "end", "scores": ChatSocketHandler.scores[room_id]}),
                        room_id
                    )

            asyncio.create_task(f())
        if type_ == "note" and self.t0 is not None:
            t1 = time.time()
            err = self.test_period - (t1 - self.t0)
            self.errs.append(err)
            self.total_err += abs(err)
            self.t0 = t1
            ChatSocketHandler.send_updates(
                json.dumps(
                    {
                        "type": "score",
                        "errs": self.errs,
                        "score": self.total_err,
                    }
                ),
                room_id
            )
            logging.info("got note %s, %s %f %f" % (message, self.id, err, self.total_err))


class SongsHandler(tornado.web.RequestHandler):

    def set_default_headers(self):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "x-requested-with")
        self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    def get(self):
        res = []
        with open("songs", "r") as f:
            for line in f:
                name = line.split('|')[0]
                res.append(name)
        import json
        return self.write(json.dumps(dict(res=res)))


async def main():
    tornado.options.parse_command_line()
    app = Application(debug=True)
    app.listen(options.port)
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
