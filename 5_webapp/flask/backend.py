from flask import Flask, request, jsonify

import capstone_recommendation as rec

app = Flask(__name__)

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