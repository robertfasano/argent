import json
import os
from PyQt5.QtWidgets import QHBoxLayout, QFileDialog, QTabWidget
from sciQt import Dashboard, IconButton
from sciQt.widgets import DACTable, TimingTable, TTLTable
from argent.generator import run_sequence
from argent.config import sequences_path


class GUI(Dashboard):
    def __init__(self):
        Dashboard.__init__(self, title='Argent control panel')
        if not os.path.exists(sequences_path):
            os.mkdir(sequences_path)

    def buildUI(self):
        button_layout = QHBoxLayout()
        start_path = 'C:/sciQt/sciQt/resources/icons/outline-play-arrow.svg'
        save_path = 'C:/sciQt/sciQt/resources/icons/content-save-outline.svg'
        load_path = 'C:/sciQt/sciQt/resources/icons/outline-folder_open-24px.svg'

        button_layout.addWidget(IconButton(start_path, lambda: run_sequence(self.timing_table.get_sequence())))
        button_layout.addWidget(IconButton(save_path, self.save))
        button_layout.addWidget(IconButton(load_path, self.load))
        button_layout.addStretch()
        self.DACs = [f'A{i}' for i in range(32)]
        ttls =  [f'A{i}' for i in range(8)]
        sequence = [{'duration': 0.2, 'TTL': ['A0'], 'DAC': {'A1': 1}}, {'duration': 0.5, 'TTL': ['A1']}]

        self.timing_table = TimingTable(sequence)
        self.timing_table.model().columnsInserted.connect(lambda: self.resize(self.timing_table.sizeHint()))
        self.timing_table.model().columnsRemoved.connect(lambda: self.resize(self.timing_table.sizeHint()))

        self.header = self.timing_table.horizontalHeader()
        self.tabs = QTabWidget()
        self.ttl_table = TTLTable(self.timing_table, ttls)
        self.dac_table = DACTable(self.timing_table, self.DACs)
        self.tabs.addTab(self.ttl_table, 'TTL')
        self.tabs.addTab(self.dac_table, 'DAC')
        self.layout.addLayout(button_layout)
        self.layout.addWidget(self.tabs)
        
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
