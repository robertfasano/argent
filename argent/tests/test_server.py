import pytest
import json
from argent.server import App

@pytest.fixture
def client():
    server = App('./config.yml')
    app = server.app

    app.config['TESTING'] = True
    return app.test_client()


def test_variables(client):
    variables = json.loads(client.get('/variables').data)
    assert variables == {}

    client.post('/variables', json={'x': 1})
    client.post('/variables', json={'y': 2})

    variables = json.loads(client.get('/variables').data)
    assert variables == {'x': 1, 'y': 2}