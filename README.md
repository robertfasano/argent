# Argent [![Build Status](https://travis-ci.org/robertfasano/argent.svg?branch=master)](https://travis-ci.org/robertfasano/argent)
Argent is a high-level sequencing interface for ARTIQ which allows experiments to be defined as sequences of individual, non-overlapping timesteps, allowing for rapid prototyping through a graphical user interface. Experiments defined by the user are fed into a code generator to produce low-level ARTIQ syntax, resulting in zero in-kernel overhead.

Using the base ARTIQ syntax, an experiment consisting of a TTL channel switching on and off looks like 
``` 
ttl0.on()
delay(3*us)
ttl0.off() 
delay(3*us)
```
Argent represents this as a two-step sequence syntactically defined as
``` 
sequence = [{'duration': '3 us', 'TTL': [0]}, 
            {'duration': '3 us', 'TTL': []}]
```
The Argent syntax is cleaner and more readable, allowing scalable sequence definition up to many TTL lines. Additionally, this higher-level syntax is compatible with a grid-based GUI which treats sequences as series of timesteps, each containing any number of RTIO events. Using either the list/dict syntax or the included Qt-based GUI, you can define any of the following events at each timestep:
* TTL on/off
* DAC voltage change
* Streamed ADC read
* DDS frequency or attenuation update

# Ongoing development
* Run user-defined functions after each sequence to process and store data.
* DAC setpoints are constant within timesteps; will add the ability to output ramps or other waveforms within a single timestep.
