# Argent
Argent is a high-level sequencing interface for ARTIQ which allows experiments to be defined as sequences of individual, non-overlapping timesteps, allowing for rapid prototyping through a graphical user interface.

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
The presence of 0 in the TTL list in the first timestep dictionary tells TTL0 to turn on, while the absence in the second timestep tells it to turn off. The beauty of this approach is that a grid-based GUI can easily be converted into such a representation, which is then parsed in an ARTIQ experiment to convert to the lower-level syntax. This intermediate parsing comes with computational overhead that limits timestep durations at around 200 us or longer, so Argent may not be suitable for experiments with rapid cycles. However, the simplicity of this approach is very useful for experiments like optical lattice clocks, which require switching of dozens of TTL lines on typical millisecond timescales - the higher-level syntax allows these complex sequences to be written with much less code than the base ARTIQ syntax.

The GUI is written in HTML, JavaScript, and CSS and should run in any browser at http://127.0.0.1:8051/. The only dependency is Flask, which is used in the Python backend to host the GUI.
