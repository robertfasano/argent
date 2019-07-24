import json
from PyQt5.QtWidgets import QHBoxLayout, QFileDialog, QDialog, QVBoxLayout
from sciQt import Dashboard, IconButton
from sciQt.widgets import TimingTable, FileEdit
from argent.generator import run_sequence
from argent import Configurator

class ConfigPopup(QDialog):
    def __init__(self):
        QDialog.__init__(self)
        self.setWindowTitle('Preferences')
        button = IconButton('settings', None)
        self.setWindowIcon(button.icon)

        layout = QVBoxLayout(self)
        config = Configurator.load()

        self.sequence_path_edit = FileEdit('Sequences folder', config['sequences_path'], type='folder')
        self.sequence_path_edit.textChanged.connect(lambda: Configurator.update('sequences_path', self.sequence_path_edit.text()))
        layout.addWidget(self.sequence_path_edit)

        self.device_db_edit = FileEdit('Device database', config['device_db'], type='file')
        self.device_db_edit.textChanged.connect(lambda: Configurator.update('device_db', self.device_db_edit.text()))
        layout.addWidget(self.device_db_edit)

        self.show()

class GUI(Dashboard):
    def __init__(self):
        Dashboard.__init__(self, title='Timing control panel')

    def config_dialog(self):
        self.config_popup = ConfigPopup()

    def buildUI(self):
        button = IconButton('timer', None)
        self.setWindowIcon(button.icon)

        button_layout = QHBoxLayout()
        button_layout.addWidget(IconButton('play', lambda: print(self.timing_table.get_sequence())))
        button_layout.addWidget(IconButton('save', self.save))
        button_layout.addWidget(IconButton('load', self.load))
        button_layout.addStretch()
        button_layout.addWidget(IconButton('settings', self.config_dialog))

        config = Configurator.load()
        ttls = []
        for ttl in config['devices']['ttl']:
            ttls.extend([f'{ttl.split("ttl")[1]}{i}' for i in range(8)])
        dacs = []
        for dac in config['devices']['dac']:
            dacs.extend([f'{dac.split("zotino")[1]}{i}' for i in range(32)])
        dds = []
        for d in config['devices']['dds']:
            dds.extend([f'{d.split("urukul")[1]}{i}' for i in range(4)])

        sequence = [{'duration': 0.2, 'TTL': ['A0'], 'DAC': {'A1': 1}, 'DDS': {'A0': {'frequency': 400}, 'A1': {'attenuation': 2}}},
                    {'duration': 0.5, 'TTL': ['A1'], 'DDS': {'A0': {'frequency': 300, 'attenuation': 3}}}]

        self.timing_table = TimingTable(sequence, ttls=ttls, dacs=dacs, dds=dds)
        self.timing_table.model().columnsInserted.connect(lambda: self.resize(self.timing_table.sizeHint()))
        self.timing_table.model().columnsRemoved.connect(lambda: self.resize(self.timing_table.sizeHint()))

        self.layout.addLayout(button_layout)
        self.layout.addWidget(self.timing_table.tabs)

        self.resize(self.timing_table.sizeHint())

    def load(self):
        path = Configurator.load()['sequences_path']
        filename = QFileDialog.getOpenFileName(self, 'Load sequence', path)[0]
        if filename == '':
            return
        with open(filename) as file:
            sequence = json.load(file)
        self.timing_table.set_sequence(sequence)

    def save(self):
        path = Configurator.load()['sequences_path']
        filename = QFileDialog.getSaveFileName(self, 'Save sequence', path)[0]
        if filename == '':
            return
        with open(filename, 'w') as file:
            json.dump(self.timing_table.get_sequence(), file)

if __name__ == '__main__':
    dashboard = GUI()
