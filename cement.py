#!/usr/bin/env python3


import asyncio
import logging
import time
import json

import tornado
from tornado import websocket
from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)


class Application(tornado.web.Application):
    def __init__(self, **kwargs):
        handlers = [(r"/chatsocket", ChatSocketHandler)]
        settings = dict(
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            xsrf_cookies=True,
        )
        super().__init__(handlers, **kwargs, **settings)


class ChatSocketHandler(websocket.WebSocketHandler):
    waiters = set()
    history = []
    history_size = 200
    test_period = 0.5
    start_count = 0

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
        print("close")
        ChatSocketHandler.start_count = 0
        ChatSocketHandler.waiters.remove(self)

    @classmethod
    def update_history(cls, chat):
        cls.history.append(chat)
        if len(cls.history) > cls.history_size:
            cls.history = cls.history[-cls.history_size:]

    @classmethod
    def send_updates(cls, message):
        logging.info("sending message to %d waiters", len(cls.waiters))
        for waiter in cls.waiters:
            try:
                waiter.write_message(message)
            except:
                logging.error("Error sending message", exc_info=True)
    t0 = 0
    total_err = 0
    id = None
    async def on_message(self, message):
        message = tornado.escape.json_decode(message)
        type = message["type"]
        if type == "join":
            self.id = message["id"]
            ChatSocketHandler.send_updates(message)
            # TODO: connection investigation
            ids = [w.id for w in self.waiters if w.id]
            if len(ids) == 2:
                ChatSocketHandler.send_updates(json.dumps({
                    "type": "ready"
                }))
        if type == "start":
            ChatSocketHandler.start_count += 1
            ids = [w.id for w in self.waiters if w.id]
            if len(ids) == ChatSocketHandler.start_count:
                for _ in range(4):
                    ChatSocketHandler.send_updates(json.dumps({
                        "type": "count"
                    }))
                    await asyncio.sleep(1)
        if type == "note":
            t1 = time.time()
            err = self.test_period - (t1 - self.t0)
            self.total_err += abs(err)
            logging.info("%s %f %f" % (self.id, err, self.total_err))
            self.t0 = t1
        # if type == "end":
        #     # send scoreboard
        #     ChatSocketHandler.send_updates(message)

        # if message:
        #     if hasattr(self, 'id'):
        #         self.test_period = float(message)
        #         print("set period:", self.test_period)
        #         return
        #     print("got id", message)
        #     self.id = message
        #     ChatSocketHandler.send_updates(message)
        #     return

       
        #parsed = tornado.escape.json_decode(message)
        #chat = {"delta": parsed}

        #chatChatSocketHandler.update_history(chat)


async def main():
    tornado.options.parse_command_line()
    app = Application(debug=True)
    app.listen(options.port)
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
