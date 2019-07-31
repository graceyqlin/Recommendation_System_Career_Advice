import pandas as pd
import json
import pymysql
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

connection = pymysql.connect(host='127.0.0.1',
                             user='root',
                             password='capstone',
                             db='capstone')

query = '''SELECT * FROM QA_FINAL'''

data = pd.read_sql(query, connection)

questions_ids = list(data.questions_id.unique())
questions_df = data[data.questions_id.isin(questions_ids)].dropna()
questions = list(questions_df.questions_body_clean)

vec = TfidfVectorizer(max_features=5000)
vec.fit_transform(questions)

vec_matrix = vec.transform(questions).todense()

def find_answers(q_id):
    answers = list(data[data.questions_id == q_id].answers_body_clean)
    return answers

def find_similar_questions(question_body: str):
    x = vec.transform([question_body]).todense()
    scores = cosine_similarity(x, vec_matrix)
    similar_inds = scores.argsort()[0][-6:-1]
    out = {}
    out["input_question_body"] = question_body
    re = []
    for i in similar_inds:
        q_id = questions_df.iloc[i,:].questions_id
        sim_question = questions_df.iloc[i,:].questions_body_clean
        answers = find_answers(q_id)
        re.append({"question_id": q_id, 
                   "question_body": sim_question,
                   "score": scores[0][i],
                   "answers": answers})
    out["similar_questions"] = re
    return out

