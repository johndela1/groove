#!/usr/bin/env python

import asyncio
import threading
import uuid
import json

import time

from websockets.client import connect
from websockets.exceptions import ConnectionClosedOK

TEST_PERIOD = 1
periods = [1,1,1,1]


async def play(ws):
    for i in range(4):
        print("play note")
        await ws.send(
            json.dumps(
                {
                    "type": "note",
                    "room_id": "1",
                }
            )
        )
        await asyncio.sleep(periods[i])


async def handle_updates(ws):
    while True:
        try:
            print("got update", id(ws), await ws.recv())
        except ConnectionClosedOK:
            print("closed")


async def join(ws):
    await ws.send(
        json.dumps(
            {
                "type": "join",
                "id": str(uuid.uuid4())[:4],
                "room_id": "1", #str(uuid.uuid4())[:4],
            }
        )
    )
async def play2(ws):
    await ws.send(json.dumps({"type": "start", "song": "default", "room_id": "1"}))
    await asyncio.sleep(4)
    await play(ws)


async def main():
        wss = [await connect("ws://localhost:8888/chatsocket?roomId=1") for _ in range(1)]
        handlers =[asyncio.create_task(handle_updates(ws)) for ws in wss]

        await asyncio.gather(*[asyncio.create_task(join(ws)) for ws in wss])
        await asyncio.gather(*[asyncio.create_task(play2(ws)) for ws in wss])
        await asyncio.gather(*handlers)
asyncio.run(main())
