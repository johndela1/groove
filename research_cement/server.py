#!/usr/bin/env python3

import asyncio

import redis.asyncio as redis

async def reader(channel: redis.client.PubSub):
    while True:
        message = await channel.get_message(ignore_subscribe_messages=True)
        if message is not None:
            print(f"(Reader) Message Received: {message}")
            if message["data"].decode() == STOPWORD:
                print("(Reader) STOP")
                break


async def handle_echo(reader, writer):
    writer.write(b"send id\r\n")
    await writer.drain()

    data = await reader.read(100)
    id_ = data.decode()
    addr = writer.get_extra_info('peername')
    print(f"Received {id_!r} from {addr!r}")

    await r.set(id_, 1)


    while True:
        data = await reader.read(100)
        breakpoint()
        if data.decode().strip() == "quit":
            await r.delete(id_)
            break
        print(data.decode(), data)
        writer.write(data)
        await writer.drain()

    print("Close the connection")
    writer.close()
    await writer.wait_closed()


r = redis.from_url("redis://localhost")

async def main():
    server = await asyncio.start_server(
        handle_echo, '127.0.0.1', 8888)

    addrs = ', '.join(str(sock.getsockname()) for sock in server.sockets)
    print(f'Serving on {addrs}')

    async with server:

        await server.serve_forever()

asyncio.run(main())
