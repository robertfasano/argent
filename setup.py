from setuptools import find_packages, setup
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
    version='1.0.0',
    description='Interactive client/server/UI framework for ARTIQ experiments',
    author='Robert Fasano',
    author_email='robbie.fasano@gmail.com',
    packages=find_packages(),
    license='MIT',
    long_description=open('README.md').read(),
    package_data={'': extra_files},
    install_requires=['scipy', 'pyyaml', 'click', 'requests', 'pandas', 'matplotlib', 'tqdm', 'flask', 'python-socketio', 'flask_socketio', 'influxdb_client', 'gevent', 'gevent-websocket', 'ipython'],
    entry_points='''
        [console_scripts]
        argent_run=argent.server:main
        ''',
)
