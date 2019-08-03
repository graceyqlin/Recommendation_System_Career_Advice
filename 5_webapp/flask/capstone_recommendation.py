import pandas as pd
import json
import pymysql
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import string

# read in Q&A dataset
connection = pymysql.connect(host='35.226.35.190',
                             user='root',
                             password='capstone',
                             db='capstone')

query = '''SELECT * FROM QA_FINAL'''
data = pd.read_sql(query, connection)

# read in BLS career dataset
query2 = '''SELECT * FROM career_clusters'''
occ_df = pd.read_sql(query2, connection)

# get just the occupation names
occupations = occ_df['Occupation'].to_list()

# split up question dataset
questions_ids = list(data.questions_id.unique())
questions_df = data[data.questions_id.isin(questions_ids)].dropna()
questions = list(questions_df.questions_body_clean.unique())


vec = TfidfVectorizer(max_features=5000)
vec.fit_transform(questions)

# Vectorize the question and occupation lists
vec_matrix = vec.transform(questions).todense()
occ_matrix = vec.transform([occ.lower() for occ in occupations]).todense()

def find_answers(q_id):
    answers = list(data[data.questions_id == q_id].answers_body_clean)
    return answers

def find_similar_questions(question_body):
    
    # remove punctuation from input question and make lower-case
    question_body_clean = question_body.lower().translate(string.punctuation.maketrans({x: '' for x in string.punctuation}))
    
    # vectorize input question
    x = vec.transform([question_body_clean]).todense()
    
    # first get the similar questions
    scores = cosine_similarity(x, vec_matrix)
    similar_inds = scores.argsort()[0][-6:-1]
    similar_qs = pd.DataFrame([questions[i] for i in similar_inds], columns = {'questions_body_clean'})
    similar_q_join = pd.merge(left = similar_qs, right = questions_df, on ='questions_body_clean', how='inner')
    out = similar_q_join[['questions_id','questions_body_clean','answers_score','answers_body_clean']]
    
    # now find the most similar BLS occupation name
    occ_scores = cosine_similarity(x, occ_matrix)
    best_ind = occ_scores.argsort()[0][-1]
    best_occ = occupations[best_ind]
    # get the corresponding SOC code for that job
    occ_soc = occ_df.loc[occ_df['Occupation'] == best_occ,'Code'].iloc[0]
        
    # add the input question, closest occupation and occupation SOC code to the output
    out['input_question_body']=question_body
    out['closest_occupation'] = best_occ
    out['soc_code'] = str(occ_soc)
    
    # rename some columns
    out = out.rename(columns={'questions_id':'question_id','questions_body_clean':'question_body','answers_score':'score',
                        'answers_body_clean':'answers'})
    
    return out
    