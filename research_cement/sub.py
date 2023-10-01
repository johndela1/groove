#!/usr/bin/env python3


import asyncio

import redis.asyncio as redis

STOPWORD = "STOP"


async def reader(channel: redis.client.PubSub):
    while True:
        message = await channel.get_message(ignore_subscribe_messages=True)
        if message is not None:
            print(f"(Reader) Message Received: {message}")
            if message["data"].decode() == STOPWORD:
                print("(Reader) STOP")
                break


async def main():
    r = redis.from_url("redis://localhost")
    async with r.pubsub() as pubsub:
        await pubsub.subscribe("channel:1", "channel:2")

        future = asyncio.create_task(reader(pubsub))

        await r.publish("channel:1", "Hello")
        await r.publish("channel:2", "World")
        await r.publish("channel:1", STOPWORD)

        await future
asyncio.run(main())
