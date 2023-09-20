#!/usr/bin/env python3

import socket
from time import sleep


TCP_IP = '127.0.0.1'
TCP_PORT = 8888
BUFFER_SIZE = 1024
MESSAGE = b"Hello, World!"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((TCP_IP, TCP_PORT))

while True:
    s.send(MESSAGE)
    sleep(1)
s.close()

print("received data:", data)
