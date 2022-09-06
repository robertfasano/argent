# Argent [![Build Status](https://app.travis-ci.com/robertfasano/argent.svg?branch=master)](https://app.travis-ci.com/github/robertfasano/argent)
Argent is a high-level sequencing interface for [ARTIQ](https://github.com/m-labs/artiq) designed for optical lattice clocks or similar repetitive experiments. Features include:
* A browser-based GUI for sequence definition
* A code generator to produce and run ARTIQ code based on user-defined sequences
* A client-server architecture allowing experimental variables to be changed or systematically optimized live without recompilation
* Integration with InfluxDB for long-term data logging and visualization

# Installation
This installation guide assumes that you've installed the [standard Anaconda distribution](https://www.anaconda.com/products/individual]). If you're not using Anaconda, Argent can still be installed as a standard Python package without a virtual environment.

Create and activate a new virtual environment:

```
conda create -n argent python=3.9
conda activate argent
```

Install using pip:

```pip install git+https://github.com/robertfasano/argent```

Alternately, you can clone the repository and install in developer mode if you need to tinker with the codebase:
```
git clone https://github.com/robertfasano/argent
cd argent
python setup.py develop
```

Argent also requires Microsoft Visual C++ 14.0 or greater, currently available at https://visualstudio.microsoft.com/visual-cpp-build-tools/.

# Ongoing development
Argent has been fully implemented on the Yb transportable optical lattice clock experiment at NIST. It is now in a fairly stable state where most changes will be non-breaking bugfixes, user experience improvements, or routine maintenance. For feature requests, or if you're interested in contributing to development or maintenance of Argent, you can contact me at robbie.fasano@gmail.com


