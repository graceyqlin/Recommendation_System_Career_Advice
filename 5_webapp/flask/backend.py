from flask import Flask, request, jsonify
from flask_cors import CORS

import capstone_recommendation as rec

app = Flask(__name__)
CORS(app)

@app.route("/", methods = ['GET','POST'])
def root():
    request.get_data()
    query = request.values['userinput']
    result = rec.find_similar_questions(query)
    response = jsonify({'result': result})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    app.run(host = '0.0.0.0', port = '5001')