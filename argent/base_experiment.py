from artiq.experiment import *
import numpy as np

from generated.run import run
from generated.build import build

class Sequencer(EnvExperiment):
    build = build
    run = run
