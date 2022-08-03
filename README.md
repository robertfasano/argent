# Argent [![Build Status](https://app.travis-ci.com/robertfasano/argent.svg?branch=master)](https://app.travis-ci.com/github/robertfasano/argent)
Argent is a high-level sequencing interface for [ARTIQ](https://github.com/m-labs/artiq) which allows experiments to be defined as sequences of individual, non-overlapping timesteps, allowing for rapid prototyping through a graphical user interface. Experiments defined by the user are fed into a code generator to produce low-level ARTIQ syntax, resulting in zero in-kernel overhead.

# Installation
This installation guide assumes that you've installed the [standard Anaconda distribution](https://www.anaconda.com/products/individual]). If you're not using Anaconda, Argent can still be installed as a standard Python package without a virtual environment.

Create and activate a new virtual environment:

```
conda create -n argent python=3.9
conda activate argent
```

Install using pip:

```pip install git+https://github.com/robertfasano/argent```

Argent also requires Microsoft Visual C++ 14.0 or greater, currently available at https://visualstudio.microsoft.com/visual-cpp-build-tools/.

# Feature requests
Contact me at robert.fasano@nist.gov or submit a pull request.


