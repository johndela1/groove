#!/usr/bin/env python3


import asyncio
import logging
import time
import json

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
            if i == 0:
                dts.append(0)
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
    waiters = set()
    history = []
    choices = []
    history_size = 200
    test_period = 1
    start_count = 0
    scores = {}
    t0 = 0
    total_err = 0
    errs = list()
    id = None

    def get_compression_options(self):
        # Non-None enables compression with default options.
        return {}

    def check_origin(self, origin):
        # XXX
        return True

    def open(self):
        print("open")
        ChatSocketHandler.waiters.add(self)

    def on_close(self):
        ChatSocketHandler.errs = list()
        ChatSocketHandler.start_count = 0
        ChatSocketHandler.choices = []
        ChatSocketHandler.waiters.remove(self)
        del ChatSocketHandler.scores[self.id]

    def load_song(self, needle, file):
        for line in file:
            haystack, song = line.split('|')
            if needle == haystack:
                return song


    @classmethod
    def update_history(cls, chat):
        cls.history.append(chat)
        if len(cls.history) > cls.history_size:
            cls.history = cls.history[-cls.history_size :]

    @classmethod
    def send_updates(cls, message):
        logging.info(
            "sending message type %s to %d waiters",
            str(message),
            len(cls.waiters),
        )

        for waiter in cls.waiters:
            try:
                waiter.write_message(message)
            except:
                logging.error("Error sending message", exc_info=True)



    async def on_message(self, message):
        message = tornado.escape.json_decode(message)
        type_ = message["type"]
        if type_ == "join":
            self.id = message["id"]
            ChatSocketHandler.send_updates(message)
            # TODO: connection investigation
            ids = [w.id for w in self.waiters if w.id]
            ChatSocketHandler.send_updates(json.dumps({"type": "ready"}))
        if type_ == "start":
            
            self.t0 = time.time() + 4
            ChatSocketHandler.choices.append(message["song"])
            async def f():
                ChatSocketHandler.start_count += 1
                ids = [w.id for w in self.waiters if w.id]
                if len(ids) == ChatSocketHandler.start_count:
                    song_name = ChatSocketHandler.choices[0]
                    with open("songs", "r") as f:
                        song = self.load_song(song_name, f)
                    
                    dts = song_to_deltas(song)
                    pitches = song_to_pitches(song)

                    for _ in range(4):
                        ChatSocketHandler.send_updates(
                            json.dumps({"type": "count"})
                        )
                        await asyncio.sleep(1)

                    for i, delta in enumerate(dts[:-1]):
                        await asyncio.sleep(delta)
                        ChatSocketHandler.send_updates(
                            json.dumps({"type": "snote", "pitch": pitches[i]})
                        )
                        
                    await asyncio.sleep(1)
                    for w in self.waiters:
                        ChatSocketHandler.scores[w.id] = w.total_err
                    ChatSocketHandler.send_updates(
                        json.dumps({"type": "end", "scores": ChatSocketHandler.scores})
                    )

            asyncio.create_task(f())
        if type_ == "note":
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
                )
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
