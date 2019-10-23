import json
import yaml
from PyQt5.QtWidgets import QHBoxLayout, QFileDialog, QDialog, QVBoxLayout, QTabWidget, QWidget, QPushButton
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QCursor
from sciQt import Dashboard, IconButton
from sciQt.widgets import TimingTable, FileEdit, LabeledComboBox, DictMenu, DictTable
from argent.generator import Generator
from argent import Configurator
from argent.dataserver import PcComm

class ExperimentPopup(QDialog):
    def __init__(self, window):
        QDialog.__init__(self)
        self.window = window
        self.setWindowTitle('Experiment setup')
        self.setWindowIcon(IconButton('tune', None).icon)
        layout = QVBoxLayout(self)
        self.build_edit = FileEdit('Build script', self.window.build_path, type='file')
        self.build_edit.textChanged.connect(lambda: setattr(self.window, 'build_path', self.build_edit.text()))
        layout.addWidget(self.build_edit)

        self.build_parameters = DictTable({})
        layout.addWidget(self.build_parameters)

        self.sync_button = QPushButton('Sync')
        self.sync_button.clicked.connect(self.sync)
        layout.addWidget(self.sync_button)

    def sync(self):
        params = self.build_parameters.get_parameters()
        self.window.main.comm.send(params)

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

class SequenceTabs(QTabWidget):
    def __init__(self, window):
        super().__init__()
        self.setContextMenuPolicy(Qt.CustomContextMenu)
        self.customContextMenuRequested.connect(self.context_menu)
        self.window = window
        self.sequences = []


    def context_menu(self, event):
        ''' Handles right-click menu on header items. '''
        idx = self.tabBar().tabAt(event)
        actions = {'Insert right': lambda: self.insert_sequence(idx+1),
                   'Insert left': lambda: self.insert_sequence(idx),
                   'Delete': lambda: self.delete_sequence(idx)
                   }
        self.menu = DictMenu('header options', actions)
        self.menu.popup(QCursor.pos())

    def delete_sequence(self, idx):
        del self.sequences[idx]
        self.removeTab(idx)

    def insert_sequence(self, idx):
        sequence = SequenceTab(self.window)
        self.sequences.insert(idx, sequence)
        self.insertTab(idx, sequence, f'Sequence {len(self.sequences)}')

class SequenceTab(QWidget):
    def __init__(self, main):
        super().__init__()
        self.main = main
        self.build_path = ''
        self.build_parameters = {}
        self.experiment_popup = ExperimentPopup(self)

        self.setLayout(QVBoxLayout())
        button_layout = QHBoxLayout()
        button_layout.addWidget(IconButton('save', self.save))
        button_layout.addWidget(IconButton('load', self.load))
        button_layout.addStretch()
        button_layout.addWidget(IconButton('tune', self.experiment_dialog))

        timestep_unit = Configurator.load('timestep_unit')
        ttls, dacs, dds, adcs = self.load_devices()


        sequence = [{'duration': 0.2, 'TTL': ['A0'], 'DAC': {'A1': 1}, 'DDS': {'A0': {'frequency': 400}, 'A1': {'attenuation': 2}}},
                    {'duration': 0.5, 'TTL': ['A1'], 'DDS': {'A0': {'frequency': 300, 'attenuation': 3}}}]

        self.timing_table = TimingTable(sequence, ttls=ttls, dacs=dacs, dds=dds, adcs=adcs, time_unit = timestep_unit)


        self.layout().addLayout(button_layout)
        self.layout().addWidget(self.timing_table.tabs)


    def load_devices(self):
        ## load devices from config file
        devices, = Configurator.load('devices')
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

        return ttls, dacs, dds, adcs

    def experiment_dialog(self):
        self.experiment_popup.show()

    def load(self):
        path, format = Configurator.load('sequences_path', 'sequence_format')
        filter = f"*.{format}"
        filename = QFileDialog.getOpenFileName(self, 'Load sequence', path, filter)[0]
        if filename == '':
            return
        with open(filename) as file:
            if format == 'json':
                preset = json.load(file)
            elif format == 'yml':
                preset = yaml.load(file, Loader=yaml.SafeLoader)
        sequence = preset['sequence']
        self.build_path = preset.get('build_path', '')
        self.timing_table.set_sequence(sequence)
        self.experiment_popup.build_parameters.set_parameters(preset.get('parameters', {}))
        self.experiment_popup.build_edit.setText(self.build_path)

    def save(self):
        path, format = Configurator.load('sequences_path', 'sequence_format')
        filter = f"*.{format}"
        filename = QFileDialog.getSaveFileName(self, 'Save sequence', path, filter)[0]
        if filename == '':
            return
        sequence = self.timing_table.get_sequence()

        preset = {'sequence': sequence, 'build_path': self.build_path,
                  'parameters': self.experiment_popup.build_parameters.get_parameters()}
        if format == 'json':
            with open(filename, 'w') as file:
                json.dump(preset, file, indent=4)
        elif format == 'yml':
            with open(filename.replace('json', 'yml'), 'w') as file:
                yaml.dump(preset, file, sort_keys=False)


class GUI(Dashboard):
    def __init__(self):
        Dashboard.__init__(self, title='ARTIQ')

    def config_dialog(self):
        self.config_popup = ConfigPopup(self)

    def experiment_dialog(self):
        self.experiment_popup = ExperimentPopup(self)

    def buildUI(self):

        button = IconButton('timer', None)
        self.setWindowIcon(button.icon)

        control_port, broadcast_port = Configurator.load('control_port', 'broadcast_port')
        self.comm = PcComm(f'127.0.0.1:{control_port}', f'127.0.0.1:{broadcast_port}')

        button_layout = QHBoxLayout()
        button_layout.addWidget(IconButton('play', self.play))
        stop_button = IconButton('stop', self.comm.stop)
        button_layout.addWidget(stop_button)
        button_layout.addStretch()

        button_layout.addWidget(IconButton('settings', self.config_dialog))

        self.tab_widget = SequenceTabs(self)
        self.tab_widget.insert_sequence(0)

        self.layout.addLayout(button_layout)
        self.layout.addWidget(self.tab_widget)
        self.resize(self.tab_widget.sequences[0].timing_table.sizeHint())

    def play(self):
        ''' Run a sequence '''
        print(self.get_sequences())
        self.comm.subscribe()
        gen = Generator(self.get_sequences())
        gen.run()

    def get_sequences(self):
        sequences = []
        for seq in self.tab_widget.sequences:
            sequences.append({'sequence': seq.timing_table.get_sequence(),
                              'build_path': seq.build_path,
                              'build_parameters': seq.experiment_popup.build_parameters.get_parameters()})
        return sequences

if __name__ == '__main__':
    dashboard = GUI()
