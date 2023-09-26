#!/usr/bin/env python

import asyncio
import threading
import uuid
import json

from time import sleep

from websockets.sync.client import connect
from websockets.exceptions import ConnectionClosedOK

TEST_PERIOD = 1


def play(ws):
    for _ in range(4):
        print("play note")
        ws.send(json.dumps({
            "type": "note",
        }))
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
    ws.send(json.dumps({
        "type": "join",
        "id": str(uuid.uuid4())[:4],
    }))
    t = threading.Thread(target=handle_updates, args=[ws])
    t.start()
    ws.send(json.dumps({"type": "start"}))
    sleep(5)
    play(ws)
    stop = True
    ws.close()
    t.join()
