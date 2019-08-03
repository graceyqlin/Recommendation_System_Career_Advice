import sys
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

sys.path.insert(1, '/home/final/pointer-generator-master/model_generator_files')
import capstone_recommendation as rec
import RunOneSummary as summary

app = Flask(__name__)
CORS(app)

@app.route("/", methods = ['GET','POST'])
def root():
    request.get_data()
    query = request.values['userinput']
    q_df = rec.find_similar_questions(query)
    ans = ' || '.join(q_df.answers.values.tolist())
    result = summary.run_example_summary(ans)
    response = jsonify({'result': result})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    app.run(host = '0.0.0.0', port = '5001')