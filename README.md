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

Install or update using pip:
```pip install git+https://github.com/robertfasano/argent```

Argent also requires Microsoft Visual C++ 14.0 or greater, currently available at https://visualstudio.microsoft.com/visual-cpp-build-tools/.

# Developing Argent
To develop Argent, clone the repository and install in development mode instead of installing with pip:
```
git clone https://github.com/robertfasano/argent
cd argent
python setup.py develop
```
To develop the web interface, you'll need to install [npm](https://www.npmjs.com/). Then, install the required js packages:
```
cd argent/static
npm install .
```
Finally, compile the web interface:
```
npm run watch
```
The ```watch``` script activates a developer mode where any changes to the code base trigger rapid recompilations. For a one-off build, you can instead call ```npm run build```.

# The config file
Before running Argent, you'll need a properly setup config.yml file. This file is essentially gateware between ARTIQ's device_db.py file and Argent, declaring and naming hardware channels. An example config.yml file is shown in the repository. The required fields are:
* device_db: a relative path from your config.yml file to ARTIQ's device_db.py. Example: "./device_db.py" (for both files in the same folder)
* addr: an IPv4 address and port for the Argent server. Example: "127.0.0.1:8051" (running on localhost with port 8051)
* environment_name: the name of the conda environment where your ARTIQ software is installed. Example: "artiq6"
* channels: a set of (key, value) entries for each channel type. The keys correspond to the channel names as they appear in the device_db.py file, while the values are display names to list in the UI.
    * ttl: (key, value) entries for digital I/O channels
    * dac: (key, value) entries for Zotino boards, grouped by board. Keys should have the format {board_name}{channel_number}. For example, if your Zotino board appears as "zotinoA" in the device_db, then channel 0 should have the key "zotinoA0".
    * dds: (key, value) entries for Urukul channels
    * adc: (key, value) entries for Sampler channels, grouped by board. Keys should be an integer from 0-7.

The optional "influx" field can be used to define a connection to an Influx database; if this is passed, all experimental variables (see the Variables section below) will be written into the database after each cycle. The subfields are:
* addr: an IPv4 address and port for the InfluxDB server. Default value is "127.0.0.1:8086".
* token: an Influx token generated in the Data->Tokens section of the Influx browser app
* org: the organization name associated with your database
* timezone: Example: "US/Mountain".
* bucket: the name of the Influx bucket to store data in

# Running Argent
To start the server, navigate to the directory containing your config.yml file in a terminal, activate the conda environment where Argent is installed, and run the command "argent_run". For example:
```
conda activate argent
cd argent_folder
argent_run
```
The server will start and the web interface can be accessed in a browser at the address defined in your config file.

# Sequence Editor
The Sequence Editor is used to define experimental sequences. Let's examine the various elements, starting at the top and moving down.

## Basic sequence actions
The panel at the top of the editor allows you to select between multiple loaded sequences, create a new blank sequence, or load a sequence from file. Below this is a row of buttons:
* Run: send the sequence to the ARTIQ hardware for execution
* Generate: run the code generation step but do not send the hardware (for debugging or testing)
* Add to playlist: add the currently selected sequence to the playlist (see the Playlists section below)
* Rename: rename the sequence
* Save: download the sequence as a .yml file
* Close: remove the sequence from memory
* Scripts: open the Scripts interface (see the following section)

## Scripts
The "Preparation script" and "Analysis script" features allow you to upload a script to run before and after each cycle of the sequence, similar to ARTIQ's built in prepare() and analyze() functions. This allows the user to implement more complicated logic beyond the capabilities of the sequence editor, e.g. to implement a servo loop. Uploaded scripts should include an entrypoint function whose name matches the filename, and ARTIQ decorators should be used to distinguish between @kernel and @rpc execution. For example, the following code could be used to implement proportional feedback in a file named "servo.py":
```
@kernel
def servo(self):
    self.error_signal = self.adc_result - self.setpoint
    self.output += self.gain * self.error_signal
```
Here, the "adc_result" variable is assumed to store a voltage measured by a Sampler board using the ADC interface in the Sequence Editor.

## Timestep definitions
The next row lists the durations of all timesteps. You can left-click a timestep to edit its value. In the popup, the link button to the right of the value can be used to toggle into Variable mode, where the duration can be linked to a variable. New timesteps can be added by clicking the plus icon at the end of the sequence. Timesteps can be reordered, inserted, or deleted by right-clicking the duration in the sequence table.

## TTL table
The TTL table shows a grid of buttons representing the state of all digital output channels over each timestep in the sequence. The state can be toggled on (red) or off (gray) by left-clicking.

## DAC table
The DAC table shows timelines representing the voltage setpoint of each channel throughout the sequence. Left-clicking on one of the points in the timeline opens a popup to define the voltage. Each timestep can operate in "Setpoint" mode, where a single value is defined, or "Ramp" mode, where the voltage is ramped between start and stop points with a settable number of steps. Using the link button to the right of each field, the setpoint and ramp start/stop points can be linked to variables.

## DDS enable table
The DDS enable table displays a grid of buttons, similar to the TTL table, which allows the rf switches on each channel to be toggled on and off at each timestep. Right-clicking any of the buttons opens a popup which allows the rf attenuation of the channel to be updated. The attenuation can be linked to a variable using the link button.

## DDS frequency table
The DDS frequency table functions identically to the DAC table, allowing the frequency of each channel during the sequence to be defined in terms of constant setpoints or ramps.

## ADC table
Similar to the TTL table, the ADC table allows sampling to be toggled on or off during each timestep. Right-clicking a button opens a popup with the following options:
* Duration: total time of sampling. Should be less than the timestep duration.
* Samples: the number of samples to acquire over the specified duration. The sampling interval (samples/duration) should be less than around 10 us to avoid RTIOUnderflows, though faster sampling in short bursts may be achievable.
* Delay: an optional delay relative to the start of the timestep to begin sampling. This can be used to compensate for slow actuators, e.g. to allow for a short acousto-optic modulator rise time when measuring a laser power from a photodiode.
When sampling is enabled, ARTIQ simultaneously samples all eight channels of the ADC, storing the results in arrays. Array reduction operations (mean, min, max, etc.) can be used to convert the data acquired from any or all of the channels to a single value, which can then be assigned to a variable.

# Playlists
Multiple sequence can be combined to create a larger sequence known as a Playlist. This system is generally used to make interleaved comparisons between a reference experiment and an experiment with some variation or external perturbation. The "Add to playlist" button in the Sequence Editor adds the active sequence to the playlist. Using the Playlist Panel, sequences within the playlist can be reordered or deleted. To run the playlist, as opposed to a single sequence, use the Play button in the upper right corner of the Playlist Panel.

When running Playlists, the "__stage__" variable will be used to differentiate experimental results from different experiments in the playlist. The first experiment has __stage__=0, the second has __stage__=1, and so on.

# Variables
The Variables panel on the left side of the web interface allows variables to be defined and sorted into groups. A variable has a name and value which are passed into the ARTIQ code at runtime and stored as attributes of the experiment class, e.g. self.voltage = 1.0. The experimental sequence can be linked to variables in various ways, for example, defining a DDS frequency at a certain timestep. Variables can also be used to store experimental results, either by using them to store ADC reads or more complicated derived values using the Scripts system. This can enhance reproducibility between experiments: the variable values and experimental results will be written to the database after each cycle, allowing the state of the experiment at any time to be recalled.

If the "Sync" checkbox is checked, the ARTIQ experiment will request new values of the variable after each sequence. This allows the experiment to be externally controlled, e.g. to vary an rf frequency and study the effects on the experiment live without recompilation. External control can be achieved either directly through the interface (edit the variable value and click the "Send" button) or through the python client (see below).

Note that the client/server communications required for the Variables system introduce a non-deterministic delay requirement after each cycle; therefore, a timestep with sufficient duration should be added near the end of the sequence to allot the required slack. This should generally be chosen to be as short as possible without resulting in RTIOUnderflows. While the experiment is running, the slack at the end of each cycle can be read off from the terminal spawned by Argent.

# Interactive control
Argent includes a Python client which can be used to communicate with the server from an external process. This can be used bidirectionally to update variables or receive data from the experiment. The client should be instantiated with the same IP address and port specified in your config.yml file. For example,
```
from argent import Client
client = Client('127.0.0.1:8051')
```
Variables can be updated or read as follows:
```
client.set('pi', 3.14)
print(client.get('pi'))
```
Once the client is instantiated, it automatically receives experimental data broadcast at the end of each cycle, storing it in a pandas DataFrame linked to the "data" attribute:
```
print(client.data)
```

## Datasets
To organize data into individual runs or measurements, you can use Datasets. In the following example, we initiate a Dataset and collect 50 points from the experiment:
```
ds = argent.dataset()
ds.collect(50)
```
The data is stored as a pandas DataFrame identically to the client's data() attribute:
```
print(ds.data)
```
Each Dataset has a unique ```run_id``` attribute which is passed to the ARTIQ experiment and included in the experimental broadcast at the end of each cycle. In the example above, the ```run_id``` on the ARTIQ hardware will be reset to ```0``` after 50 points are acquired, telling the Dataset object that the run is complete. You can call the ```collect()``` method again to resume the run and gather a specified number of additional points.

For interleaved measurements using the Playlists system, you can divide data by stage using pandas syntax. For example, the average frequency difference between two stages would look like:
```
f0 = ds.data[ds.data['__stage__']==0]
f1 = ds.data[ds.data['__stage__']==1]
delta_f = (f1 - f0).mean()
```

## Sweeps
Variable sweeps can be triggered with syntax like the following:
```
sweep = argent.sweep('x', 0, 1, 50, , sweeps=3, legend=['y', [0, 1, 2]], plot='f')
```
The "sweep" function uses the same syntax as numpy's linspace function: here, we sweep a variable called "x" from 0 to 1 over 50 steps. The sweep function takes an optional "sweeps" argument which can be used to average multiple sweeps. The "legend" argument is used to repeat the sweep for different values of a second variable, here called "y". We also passed a variable name to the "plot" keyword argument, which produces a realtime plot of a variable "f" as a function of "x" and "y".

After running a sweep, you can repeat it by calling ```sweep.run()```. 

The ```sweep.find_max()``` and ```find_min()``` functions allow you to find the value of "x" corresponding to the maximum or minimum value of "y". If you pass the keyword "interpolate=True" to either of these functions, the optimization will use a cubic spline to fit the data; otherwise, the returned point will be a point explicitly measured in the sweep.

# FAQ
**Why is my experiment crashing with RTIOUnderflow exceptions?**
If you haven't yet, familiarize yourself with ARTIQ's [Real-Time I/O Concepts](http://m-labs.hk/artiq/manual/rtio.html). An RTIOUnderflow occurs when events are scheduled with a timestamp in the past, which can occur if you try to schedule events faster than they can be executed. This can occur for a few reasons in Argent:
* Not allocating enough time at the end of the sequence for client-server communications
* Scheduling demanding events like ramps simultaneously with or shortly after ADC events (which consume all slack)
* Forgetting to include delays in scripts to account for script execution time
Generally you can troubleshoot an RTIOUnderflow by reading the traceback that's generated when the exception occurs. This should point to a line in the generated_experiment.py file, located in the same directory as your config.yml, which will show where the experiment needs to be modified.

**Why did my sequences disappear?**
Sequences are stored in the browser's Local Storage when Argent is running. Occasionally, the Local Storage can be reset due to a browser update or an out-of-memory error. When this happens, Argent will return to its default state and your data will be lost. To prevent this, you should regularly save sequences to file using the "Save" button in the Sequence Editor.

**Why don't new channels appear in the web interface after I've updated my config file?**
In order to force new channels to appear, you'll need to clear the browser's Local Storage. WARNING: THIS WILL ERASE ALL SEQUENCES AND VARIABLES FROM MEMORY. MAKE SURE YOU SAVE ANY IMPORTANT SEQUENCES TO FILE SO THEY CAN BE RECOVERED AFTERWARDS.

To reset Local Storage:
1. Press F12 to open the Developer Tools panel.
2. Go to the Application tab.
3. Under Storage -> Local Storage, look for the entry matching Argent's IP:port. Right click it and select "Clear".
4. Do a hard refresh with ctrl+shift+R.

# Ongoing development
Argent has been fully implemented on the Yb transportable optical lattice clock experiment at NIST. It is now in a fairly stable state where most changes will be non-breaking bugfixes, user experience improvements, or routine maintenance. For feature requests, or if you're interested in contributing to development or maintenance of Argent, you can contact me at robbie.fasano@gmail.com


