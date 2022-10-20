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
    assert variables == {'__run_id__': {'value': 0.0}}

    client.post('/variables', json={'x': {"value": 1, "sync": False, "current": 1, "group": "default"}})
    client.post('/variables', json={'y': {"value": 2, "sync": False, "current": 1, "group": "default"}})

    variables = json.loads(client.get('/variables').data)
    assert variables['x']['value'] == 1
    assert variables['y']['value'] == 2