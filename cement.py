import asyncio
import logging
import time

import tornado
from tornado import websocket
from tornado.options import define, options

define("port", default=8888, help="run on the given port", type=int)


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [(r"/chatsocket", ChatSocketHandler)]
        settings = dict(
            cookie_secret="__TODO:_GENERATE_YOUR_OWN_RANDOM_VALUE_HERE__",
            xsrf_cookies=True,
        )
        super().__init__(handlers, **settings)


class ChatSocketHandler(websocket.WebSocketHandler):
    waiters = set()
    history = []
    history_size = 200

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
    def on_message(self, message):
        #breakpoint()
        if message:
            print("got id", message)
            self.id = message
            self.t0 = time.time()
            ChatSocketHandler.send_updates(message)
            return

        t1 = time.time()
        logging.info("period %r for id %s" % (t1 - self.t0, self.id))
        self.t0 = t1
        #parsed = tornado.escape.json_decode(message)
        #chat = {"delta": parsed}

        #chatChatSocketHandler.update_history(chat)


async def main():
    tornado.options.parse_command_line()
    app = Application()
    app.listen(options.port)
    await asyncio.Event().wait()


if __name__ == "__main__":
    asyncio.run(main())
