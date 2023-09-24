#!/usr/bin/env python

import asyncio
import threading
import uuid

from time import sleep

from websockets.sync.client import connect
from websockets.exceptions import ConnectionClosedOK

TEST_PERIOD = 10

def play(ws):
    for _ in range(100):
        ws.send("")
        sleep(TEST_PERIOD)

def handle_updates(ws):
    while True:
        global stop
        if stop:
            print("stop handle_updates")
            break
        try:
            print("got update", ws.recv())
        except ConnectionClosedOK:
            print('closed')

stop = False
with connect("ws://localhost:8888/chatsocket") as ws:
    ws.send(str(uuid.uuid4())[:4])
    ws.send(str(TEST_PERIOD))
    t = threading.Thread(target=handle_updates, args=[ws])
    t.start()
    play(ws)
    stop=True
    ws.close()
    t.join()
