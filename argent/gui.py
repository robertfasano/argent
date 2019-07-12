from sciQt import Dashboard, TTLTable, IconButton
from PyQt5.QtWidgets import QHBoxLayout, QFileDialog
from PyQt5.QtCore import QSize

from generator import run_sequence
import json

class GUI(Dashboard):
    def __init__(self):
        Dashboard.__init__(self, title='Argent control panel')

    def buildUI(self):
        button_layout = QHBoxLayout()
        start_path = 'C:/sciQt/sciQt/resources/icons/outline-play-arrow.svg'
        save_path = 'C:/sciQt/sciQt/resources/icons/content-save-outline.svg'
        load_path = 'C:/sciQt/sciQt/resources/icons/outline-folder_open-24px.svg'

        button_layout.addWidget(IconButton(start_path, lambda: run_sequence(self.ttl_table.get_sequence())))
        button_layout.addWidget(IconButton(save_path, self.save))
        button_layout.addWidget(IconButton(load_path, self.load))

        ttls =  [f'A{i}' for i in range(0,8)]
        sequence = [{'duration': 0.2, 'TTL': ['A0']}, {'duration': 0.5, 'TTL': ['A1']}]
        self.ttl_table = TTLTable(ttls, sequence=sequence)


        self.layout.addLayout(button_layout)
        self.layout.addWidget(self.ttl_table)
        self.ttl_table.resizeToFit()

    def load(self):
        filename = QFileDialog.getOpenFileName(self, 'Load sequence')[0]
        if filename == '':
            return
        with open(filename) as file:
            sequence = json.load(file)
        self.ttl_table.set_sequence(sequence)

    def save(self):
        filename = QFileDialog.getSaveFileName(self, 'Save sequence')[0]
        with open(filename, 'w') as file:
            json.dump(self.ttl_table.get_sequence(), file)

    def sizeHint(self):
        return QSize(self.ttl_table.columnCount()*75+75, self.ttl_table.rowCount()*30+130)

if __name__ == '__main__':
    dashboard = GUI()
