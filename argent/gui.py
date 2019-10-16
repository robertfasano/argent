import json
import yaml
from PyQt5.QtWidgets import QHBoxLayout, QFileDialog, QDialog, QVBoxLayout
from sciQt import Dashboard, IconButton
from sciQt.widgets import TimingTable, FileEdit, LabeledComboBox
from argent.generator import Generator
from argent import Configurator

class ExperimentPopup(QDialog):
    def __init__(self, window):
        QDialog.__init__(self)
        self.window = window
        self.setWindowTitle('Experiment setup')
        self.setWindowIcon(IconButton('tune', None).icon)
        layout = QVBoxLayout(self)
        self.build_edit = FileEdit('Build script', self.window.build_path, type='file')
        self.build_edit.textChanged.connect(lambda: setattr(self.window, 'build_path', self.build_edit.text()))
        self.analysis_edit = FileEdit('Analysis script', self.window.analysis_path, type='file')
        self.analysis_edit.textChanged.connect(lambda: setattr(self.window, 'analysis_path', self.build_edit.text()))


        layout.addWidget(self.build_edit)
        layout.addWidget(self.analysis_edit)

        self.show()

class ConfigPopup(QDialog):
    def __init__(self, window):
        QDialog.__init__(self)
        self.window = window
        self.setWindowTitle('Preferences')
        button = IconButton('settings', None)
        self.setWindowIcon(button.icon)
        layout = QVBoxLayout(self)

        path, format, device_db, timestep_unit = Configurator.load('sequences_path', 'sequence_format', 'device_db', 'timestep_unit')
        self.sequence_path_edit = FileEdit('Sequences folder', path, type='folder')
        self.sequence_path_edit.textChanged.connect(lambda: Configurator.update('sequences_path', self.sequence_path_edit.text()))
        layout.addWidget(self.sequence_path_edit)

        self.device_db_edit = FileEdit('Device database', device_db, type='file', extension='.py')
        self.device_db_edit.textChanged.connect(lambda: Configurator.update('device_db', self.device_db_edit.text()))
        layout.addWidget(self.device_db_edit)

        self.sequence_format_box = LabeledComboBox('Sequence format', ['yml', 'json'])
        index = {'yml': 0, 'json': 1}[format]
        self.sequence_format_box.setCurrentIndex(index)
        self.sequence_format_box.currentTextChanged.connect(lambda: Configurator.update('sequence_format', self.sequence_format_box.currentText()))
        layout.addWidget(self.sequence_format_box)

        self.time_unit_box = LabeledComboBox('Default timestep unit', ['s', 'ms', 'us'])
        index = {'s': 0, 'ms': 1, 'us': 2}[timestep_unit]
        self.time_unit_box.setCurrentIndex(index)
        self.time_unit_box.currentTextChanged.connect(self.update_timestep_unit)
        layout.addWidget(self.time_unit_box)

        self.show()

    def update_timestep_unit(self):
        unit = self.time_unit_box.currentText()
        Configurator.update('timestep_unit', unit)
        self.window.timing_table.time_unit = unit

class GUI(Dashboard):
    def __init__(self):
        Dashboard.__init__(self, title='ARTIQ')


    def config_dialog(self):
        self.config_popup = ConfigPopup(self)

    def experiment_dialog(self):
        self.experiment_popup = ExperimentPopup(self)

    def buildUI(self):
        self.build_path = ''
        self.analysis_path = ''
        button = IconButton('timer', None)
        self.setWindowIcon(button.icon)

        button_layout = QHBoxLayout()
        # button_layout.addWidget(IconButton('play', lambda: print(self.timing_table.get_sequence())))
        button_layout.addWidget(IconButton('play', self.play))

        button_layout.addWidget(IconButton('save', self.save))
        button_layout.addWidget(IconButton('load', self.load))
        button_layout.addStretch()
        button_layout.addWidget(IconButton('tune', self.experiment_dialog))
        button_layout.addWidget(IconButton('settings', self.config_dialog))

        devices, timestep_unit = Configurator.load('devices', 'timestep_unit')
        ttls = []
        for ttl in devices['ttl']:
            ttls.extend([f'{ttl.split("ttl")[1]}{i}' for i in range(8)])
        dacs = []
        for dac in devices['dac']:
            dacs.extend([f'{dac.split("zotino")[1]}{i}' for i in range(32)])
        dds = []
        for d in devices['dds']:
            dds.extend([f'{d.split("urukul")[1]}{i}' for i in range(4)])
        adcs = []
        for adc in devices['adc']:
            adcs.append(adc.split("sampler")[1])

        sequence = [{'duration': 0.2, 'TTL': ['A0'], 'DAC': {'A1': 1}, 'DDS': {'A0': {'frequency': 400}, 'A1': {'attenuation': 2}}},
                    {'duration': 0.5, 'TTL': ['A1'], 'DDS': {'A0': {'frequency': 300, 'attenuation': 3}}}]

        self.timing_table = TimingTable(sequence, ttls=ttls, dacs=dacs, dds=dds, adcs=adcs, time_unit = timestep_unit)
        self.timing_table.model().columnsInserted.connect(lambda: self.resize(self.timing_table.sizeHint()))
        self.timing_table.model().columnsRemoved.connect(lambda: self.resize(self.timing_table.sizeHint()))

        self.layout.addLayout(button_layout)
        self.layout.addWidget(self.timing_table.tabs)

        self.resize(self.timing_table.sizeHint())

    def play(self):
        ''' Run a sequence '''
        gen = Generator(self.timing_table.get_sequence(), analysis_path = self.analysis_path, build_path = self.build_path)
        gen.run()

    def load(self):
        path, format = Configurator.load('sequences_path', 'sequence_format')
        filter = f"*.{format}"
        filename = QFileDialog.getOpenFileName(self, 'Load sequence', path, filter)[0]
        if filename == '':
            return
        with open(filename) as file:
            if format == 'json':
                sequence = json.load(file)
            elif format == 'yml':
                sequence = yaml.load(file, Loader=yaml.SafeLoader)

        self.timing_table.set_sequence(sequence)

    def save(self):
        path, format = Configurator.load('sequences_path', 'sequence_format')
        filter = f"*.{format}"
        filename = QFileDialog.getSaveFileName(self, 'Save sequence', path, filter)[0]
        if filename == '':
            return
        sequence = self.timing_table.get_sequence()
        if format == 'json':
            with open(filename, 'w') as file:
                json.dump(sequence, file, indent=4)
        elif format == 'yml':
            with open(filename.replace('json', 'yml'), 'w') as file:
                yaml.dump(sequence, file, sort_keys=False)

if __name__ == '__main__':
    dashboard = GUI()
