from argent import Configurator

def test_update_config():
    old_path, = Configurator.load('sequences_path')
    Configurator.update('sequences_path', 'C:/')

    assert Configurator.load('sequences_path')[0] == 'C:/'

    Configurator.update('sequences_path', old_path)
