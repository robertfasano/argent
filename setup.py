from distutils.core import setup
from setuptools import find_packages
import os

def package_files(directory):
    paths = []
    for (path, directories, filenames) in os.walk(directory):
        for filename in filenames:
            paths.append(os.path.join('..', path, filename))
    return paths
extra_files = package_files('argent')

setup(
    name='argent',
    version='0.1',
    description='High-level sequence control interface for ARTIQ',
    author='Robert Fasano',
    author_email='robert.j.fasano@colorado.edu',
    packages=find_packages(),
    license='MIT',
    long_description=open('README.md').read(),
    package_data={'': extra_files},
    install_requires=['scipy', 'pyyaml', 'click', 'requests', 'pyzmq', 'pandas', 'matplotlib', 'tqdm', 'flask', 'python-socketio', 'flask_socketio', 'influxdb_client', 'gevent', 'gevent-websocket', 'ipython', 'websocket-client'],
    entry_points='''
        [console_scripts]
        argent_run=argent.server:main
        ''',
)
