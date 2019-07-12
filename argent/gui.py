from sciQt import Dashboard, TTLTable, IconButton
from PyQt5.QtWidgets import QHBoxLayout, QFileDialog
from PyQt5.QtCore import QSize

from generator import run_sequence
from argent.config import sequences_path
import json
import os

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

        button_layout.addWidget(IconButton(start_path, lambda: run_sequence(self.ttl_table.get_sequence())))
        button_layout.addWidget(IconButton(save_path, self.save))
        button_layout.addWidget(IconButton(load_path, self.load))
        button_layout.addStretch()
        ttls =  [f'A{i}' for i in range(0,8)]
        sequence = [{'duration': 0.2, 'TTL': ['A0']}, {'duration': 0.5, 'TTL': ['A1']}]
        self.ttl_table = TTLTable(ttls, sequence=sequence)


        self.layout.addLayout(button_layout)
        self.layout.addWidget(self.ttl_table)
        self.ttl_table.resizeToFit()

    def load(self):
        filename = QFileDialog.getOpenFileName(self, 'Load sequence', sequences_path)[0]
        if filename == '':
            return
        with open(filename) as file:
            sequence = json.load(file)
        self.ttl_table.set_sequence(sequence)

    def save(self):
        filename = QFileDialog.getSaveFileName(self, 'Save sequence', sequences_path)[0]
        if filename == '':
            return
        with open(filename, 'w') as file:
            json.dump(self.ttl_table.get_sequence(), file)

    def sizeHint(self):
        return self.ttl_table.sizeHint()  #+ QSize(0, self.ttl_table.sizeHint().height())

if __name__ == '__main__':
    dashboard = GUI()
