import sys
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

sys.path.insert(1, '/home/final/pointer-generator-master/model_generator_files')
import capstone_recommendation as rec
import RunOneSummary as summ
import get_oes_data as oes
import clean_summary as clean

app = Flask(__name__)
CORS(app)

@app.route("/", methods = ['GET','POST'])
def root():
    request.get_data()
    query = request.values['userinput']
    q_df = rec.find_similar_questions(query)
    ans = ' '.join(q_df.answers.values.tolist()).encode('utf-8')
    summary_raw = summ.run_example_summary(ans)
    summary = clean.clean_sum(summary_raw)
    stats = oes.get_cluster_data(q_df.closest_pathway.iloc[0])
    response = jsonify({
        'summary': summary,
        'questions': [x for x in q_df.T.to_dict().values()],
        'stats': stats
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    app.run(host = '0.0.0.0', port = '5001')