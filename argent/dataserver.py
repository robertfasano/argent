''' This module facilitates continuous data logging on the host PC using a ZMQ
    protocol on localhost.
'''
import zmq
from threading import Thread

class DataClient():
    def __init__(self, address='127.0.0.1:1105'):
        self.socket = zmq.Context().socket(zmq.PAIR)
        self.socket.bind("tcp://{}".format(address))

    def send(self, text):
        self.socket.send_string(text)

    def start(self):
        Thread(target=self.subscribe).start()

    def subscribe(self):
        self.running = True
        while self.running:
            data = self.socket.recv_json()
            self.socket.send_string(str(self.running))
            print('NEW DATA:', data)
        data = self.socket.recv_json()
        self.socket.send_string(str(self.running))

    def stop(self):
        self.running = False

class DataServer:
    def __init__(self, address='127.0.0.1:1105'):
        self.online = True
        self.socket = zmq.Context().socket(zmq.PAIR)
        self.socket.RCVTIMEO = 0
        self.socket.connect("tcp://{}".format(address))

    def send(self, data):
        self.socket.send_json({'data': data})    # send data out of thread
        self.online = bool(self.socket.recv_string())

    def receive(self):
        try:
            text = self.socket.recv_string()
        except zmq.Again:
            text = 'none'
        return text
