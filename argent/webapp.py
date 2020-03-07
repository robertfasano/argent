from flask import Flask, request
from flask import render_template, send_from_directory
import os

def host(addr='127.0.0.1', port=8051):
    app = Flask(__name__)

    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(os.path.join(app.root_path, 'static'),
                                   'favicon.ico', mimetype='image/vnd.microsoft.icon')

    @app.route("/")
    def hello():
        return render_template('index.html')

    app.run(debug=True, host=addr, port=port)

if __name__ == "__main__":
    host('127.0.0.1', 8051)
