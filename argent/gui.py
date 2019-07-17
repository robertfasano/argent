import json
import os
from PyQt5.QtWidgets import QHBoxLayout, QFileDialog, QTabWidget
from sciQt import Dashboard, IconButton, path as sciQt_path
from sciQt.widgets import TimingTable
from argent.generator import run_sequence
from argent.config import sequences_path

class GUI(Dashboard):
    def __init__(self):
        Dashboard.__init__(self, title='Timing control panel')
        if not os.path.exists(sequences_path):
            os.mkdir(sequences_path)

    def buildUI(self):
        button_layout = QHBoxLayout()

        start_path = sciQt_path + '/resources/icons/outline-play-arrow.svg'
        save_path = sciQt_path + '/resources/icons/content-save-outline.svg'
        load_path = sciQt_path + '/resources/icons/outline-folder_open-24px.svg'

        # button_layout.addWidget(IconButton(start_path, lambda: run_sequence(self.timing_table.get_sequence())))
        button_layout.addWidget(IconButton(start_path, lambda: print(self.timing_table.get_sequence())))

        button_layout.addWidget(IconButton(save_path, self.save))
        button_layout.addWidget(IconButton(load_path, self.load))
        button_layout.addStretch()

        ttls =  [f'A{i}' for i in range(8)]
        dacs = [f'A{i}' for i in range(32)]
        dds = [f'A{i}' for i in range(4)]
        sequence = [{'duration': 0.2, 'TTL': ['A0'], 'DAC': {'A1': 1}, 'DDS': {'A0': {'frequency': 400}, 'A1': {'attenuation': 2}}},
                    {'duration': 0.5, 'TTL': ['A1'], 'DDS': {'A0': {'frequency': 300, 'attenuation': 3}}}]

        self.timing_table = TimingTable(sequence, ttls=ttls, dacs=dacs, dds=dds)
        self.timing_table.model().columnsInserted.connect(lambda: self.resize(self.timing_table.sizeHint()))
        self.timing_table.model().columnsRemoved.connect(lambda: self.resize(self.timing_table.sizeHint()))

        self.layout.addLayout(button_layout)
        self.layout.addWidget(self.timing_table.tabs)

        self.resize(self.timing_table.sizeHint())

    def load(self):
        filename = QFileDialog.getOpenFileName(self, 'Load sequence', sequences_path)[0]
        if filename == '':
            return
        with open(filename) as file:
            sequence = json.load(file)
        self.timing_table.set_sequence(sequence)

    def save(self):
        filename = QFileDialog.getSaveFileName(self, 'Save sequence', sequences_path)[0]
        if filename == '':
            return
        with open(filename, 'w') as file:
            json.dump(self.timing_table.get_sequence(), file)

if __name__ == '__main__':
    dashboard = GUI()
