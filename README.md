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
The presence of 0 in the TTL list in the first timestep dictionary tells TTL0 to turn on, while the absence in the second timestep tells it to turn off. The beauty of this approach is that a grid-based GUI can easily be converted into such a representation, which is then fed into a code generator to produce the lower level syntax. To demonstrate this advantage, let's look at a more complex experiment, which turns on four TTLs, then gradually turns them off in steps:

Base ARTIQ syntax:
``` 
with parallel:
     ttl0.on()
     ttl1.on()
     ttl2.on()
     ttl3.on()
delay(3*us)
ttl0.off() 
delay(5*us)
ttl1.off()
delay(7*us)
ttl2.off()
ttl3.off()
delay(2*us)
```
Argent syntax:
``` 
sequence = [{'duration': '3 us', 'TTL': [0, 1, 2, 3]}, 
            {'duration': '5 us', 'TTL': [1, 2, 3]},
            {'duration': '7 us', 'TTL': [2, 3]},
            {'duration': '2 us', 'TTL': []}]
```
The Argent syntax is cleaner and more readable, allowing scalable sequence definition up to many TTL lines.

# The user interface
The GUI is written in HTML, JavaScript, and CSS and should run in any browser at http://127.0.0.1:8051/. The only dependency is Flask, which is used in the Python backend to host the GUI.

# Ongoing development
* ADC control is implemented but data is not yet stored.
* DAC setpoints are constant within timesteps; will add the ability to output ramps or other waveforms within a single timestep.
* Per-timestep DDS updates are enabled through the dictionary format but not yet through the GUI.
