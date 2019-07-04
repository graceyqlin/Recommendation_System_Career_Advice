import re
import pandas as pd
from nltk import word_tokenize

def convert_to_df(file, body):

    # clean text
    # split at line breaks to isolate each line of the resume. remove tabs
    split = body.replace('\t','').split('\n')
    body_clean=[]
    
    # for each line, remove numbers, extra white space and punctuation (except commas)
    for line in split:
        line_clean = re.sub(r'[0-9.#–()+-]', '', line).strip()
        line_clean = " ".join(re.split("\s+", line_clean, flags=re.UNICODE))      
        # if the line has more than 4 tokenized words, add it as a resume line.
        # purpose is to remove any headers or unusefully short lines
        if len(word_tokenize(line_clean))>4:
            body_clean.append(line_clean)

    # extract job title from file location
    file_loc = file.split('/')
    # some files are at the master level, in which case we don't have a category so just keep same as file name
    if len(file_loc)==1:
        category = file_loc
        name = file_loc
    # otherwise, the child folder is the category of the resume. name is just the file name   
    else:
        category = file_loc[0]
        name = file_loc[-1].replace('.docx','')
    
    # create columns for dataframe
    num_lines = len(body_clean)
    category_col = [category]*num_lines
    name_col = [name]*num_lines
    
    # write the category, name and resume lines to dataframe
    resume_df = pd.DataFrame({'category': category_col, 'name': name_col, 'resume_line': body_clean})
    
    return resume_df
    