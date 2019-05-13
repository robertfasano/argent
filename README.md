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
The presence of 0 in the TTL list in the first timestep dictionary tells TTL0 to turn on, while the absence in the second timestep tells it to turn off. The beauty of this approach is that a grid-based GUI can easily be converted into such a representation, which is then parsed in an ARTIQ experiment to convert to the lower-level syntax. This intermediate parsing comes with computational overhead that limits timestep durations at around 200 us or longer, so Argent may not be suitable for experiments with rapid cycles. However, the simplicity of this approach is very useful for experiments like optical lattice clocks, which require switching of dozens of TTL lines on typical millisecond timescales - the higher-level syntax allows these complex sequences to be written with much less code than the base ARTIQ syntax. To demonstrate this advantage, let's look at a more complex experiment, which turns on four TTLs, then gradually turns them off in steps:

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
Currently, the conversion from Argent to ARTIQ syntax happens within the EnvExperiment class, incurring computational overhead that can cause RTIO overflows for very rapid cycles. This could be avoided if Argent generated the code for the EnvExperiment directly with hard-coded timings pulled from the UI. This will be added in a future release.
