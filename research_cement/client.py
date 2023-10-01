#!/usr/bin/env python3


import asyncio
import sys

async def tcp_echo_client(id_):
    reader, writer = await asyncio.open_connection(
        '127.0.0.1', 8888)

    print(f'Send: {id_!r}')
    writer.write(id_.encode())
    await writer.drain()

    data = await reader.read(100)
    print(f'Received: {data.decode()!r}')

    print('Close the connection')
    writer.close()
    await writer.wait_closed()

try:
    id_ = sys.argv[1]
except IndexError:
    sys.stderr.write("usage: %s <unique id>\n" % sys.argv[0])
    exit(1)

asyncio.run(tcp_echo_client(id_))
