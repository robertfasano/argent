from argent.main import *
import requests
import time

def test_host():
    from threading import Thread
    server = Thread(target=app.run)
    server.start()
    assert requests.get('http://127.0.0.1:5000/test').text == 'Hello, world!'
    requests.post('http://127.0.0.1:5000/shutdown')
