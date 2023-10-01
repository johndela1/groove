#!/usr/bin/env python

import asyncio
import threading
import uuid
import json

import time
from time import sleep

from websockets.sync.client import connect
from websockets.exceptions import ConnectionClosedOK

TEST_PERIOD = 1
periods = [1,0.5,0.5,1,1]


def play(ws):
    for _ in range(5):
        print("play note")
        ws.send(
            json.dumps(
                {
                    "type": "note",
                }
            )
        )
        sleep(periods[_])


def handle_updates(ws):
    while True:
        global stop
        if stop:
            print("stop handle_updates")
            break
        try:
            print("got update", ws.recv())
        except ConnectionClosedOK:
            print("closed")


stop = False
with connect("ws://localhost:8888/chatsocket") as ws:
    ws.send(
        json.dumps(
            {
                "type": "join",
                "id": str(uuid.uuid4())[:4],
            }
        )
    )
    t = threading.Thread(target=handle_updates, args=[ws])
    t.start()
    ws.send(json.dumps({"type": "start", "song": "default2"}))
    print("sent", time.time())
    sleep(4)
    play(ws)
    stop = True
    ws.close()
    t.join()
