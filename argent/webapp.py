from flask import Flask, request
from flask import render_template

def host(addr='127.0.0.1', port=8051):
    app = Flask(__name__)

    @app.route("/")
    def hello():
        return render_template('index.html')

    app.run(debug=True, host=addr, port=port)

if __name__ == "__main__":
    host('127.0.0.1', 8051)
