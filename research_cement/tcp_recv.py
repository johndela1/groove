#!/usr/bin/env python3

import socket
from time import time

TCP_IP = '127.0.0.1'
TCP_PORT = 8888
BUFFER_SIZE = 20  # Normally 1024, but we want fast response

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
s.bind((TCP_IP, TCP_PORT))
s.listen(1)

conn, addr = s.accept()
print('Connection address:', addr)

t0 = time()
while 1:
    data = conn.recv(BUFFER_SIZE)
    t1 = time()
    print(t1 - t0)
    t0 = t1
    if not data: break
    #print("received data:", data)
    #conn.send(data)  # echo
conn.close()
