from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/", methods = ['GET','POST'])
def root():
    request.get_data()
    query = request.values['userinput']
    response = jsonify({'result': query})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    app.run()