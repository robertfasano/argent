from argent.main import host
import requests
import time
from threading import Thread

def test_host():
    server = Thread(target=host, args=('127.0.0.1', 8051))
    server.start()
    time.sleep(30)
    assert requests.get('http://127.0.0.1:8051/test').text == 'Hello, world!'
    requests.post('http://127.0.0.1:8051/shutdown')
