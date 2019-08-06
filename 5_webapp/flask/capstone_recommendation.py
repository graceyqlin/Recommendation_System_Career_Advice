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
                             db='capstone',
                             use_unicode = True,
                             charset = 'utf8')

query = '''SELECT * FROM QA_FINAL'''
data = pd.read_sql(query, connection)

# read in BLS career dataset
query2 = '''SELECT * FROM career_clusters'''
occ_df = pd.read_sql(query2, connection)

# get just the occupation names
occ_raw = occ_df['Occupation'].to_list()

# new list occupations will convert plural occupations to singular
occupations = []
for occ in occ_raw:
    occ_new=[]
    for word in occ.split(' '):
        if word[-1]=='s':
            occ_new.append(word[:-1])
        else:
            occ_new.append(word)
    occupations.append(' '.join(word for word in occ_new))

# add this new column to the original df
occ_df['Occupation_clean']=occupations

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
    question_body_clean = ''.join(s for s in question_body if s not in string.punctuation).lower()
    
    # vectorize input question
    x = vec.transform([question_body_clean]).todense()
    
    # first get the similar questions
    scores = cosine_similarity(x, vec_matrix)
    similar_inds = scores.argsort()[0][-6:-1]
    similar_qs = pd.DataFrame([questions[i] for i in reversed(similar_inds)], columns = {'questions_body_clean'})
    similar_q_join = pd.merge(left = similar_qs, right = questions_df, on ='questions_body_clean', how='inner')
    out = similar_q_join[['questions_id','questions_body_clean','answers_score','answers_body_clean']].copy()
    
    # now find the most similar BLS occupation name
    occ_scores = cosine_similarity(x, occ_matrix)
    best_ind = occ_scores.argsort()[0][-1]
    best_occ = occupations[best_ind]
    print(best_occ)
    # get the corresponding SOC code and career pathway for that job
    occ_path = occ_df.loc[occ_df['Occupation_clean'] == best_occ,'Pathway'].iloc[0]
    occ_soc = occ_df.loc[occ_df['Occupation_clean'] == best_occ,'Cod'].iloc[0]
        
    # add the input question, closest occupation and occupation SOC code to the output
    out['input_question_body']=question_body
    out['closest_occupation'] = best_occ
    out['closest_pathway'] = occ_path
    out['soc_code'] = str(occ_soc)
    
    # rename some columns
    out = out.rename(columns={'questions_id':'question_id','questions_body_clean':'question_body','answers_score':'score',
                        'answers_body_clean':'answers'})
    
    return out