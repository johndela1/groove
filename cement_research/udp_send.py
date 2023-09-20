import socket
from time import sleep

UDP_IP = "127.0.0.1"
UDP_PORT = 8888
MESSAGE = b"Hello, World!"

print("UDP target IP: %s" % UDP_IP)
print("UDP target port: %s" % UDP_PORT)
print("message: %s" % MESSAGE)

sock = socket.socket(socket.AF_INET, # Internet
                     socket.SOCK_DGRAM) # UDP
for i in range(10):
    sock.sendto(MESSAGE, (UDP_IP, UDP_PORT))
    sleep(1)

