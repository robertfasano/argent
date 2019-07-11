from distutils.core import setup
from setuptools import find_packages

setup(
    name='argent',
    version='0.1',
    description='High-level sequence control interface for ARTIQ',
    author='Robert Fasano',
    author_email='robert.j.fasano@colorado.edu',
    packages=find_packages(),
    license='MIT',
    long_description=open('README.md').read(),
    install_requires=['flask', 'pint', 'requests']
)
