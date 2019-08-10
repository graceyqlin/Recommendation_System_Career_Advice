import sys
import os, shutil
import subprocess

sys.path.append("..")

from make_data_for_summarization import make_summarization_data

folder = '/home/final/pointer-generator-master/temp_sum/'

def run_example_summary(input_text):
    #Clear Files
    for the_file in os.listdir(folder):
        file_path = os.path.join(folder, the_file)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
            #elif os.path.isdir(file_path): shutil.rmtree(file_path)
        except Exception as e:
            print(e)
    #Make a file of data to be summarized 
    make_summarization_data(input_text)
    #Run the summarization
    bashCommand = ['python','/home/final/pointer-generator-master/model_generator_files/run_summarization_capstone.py']
    subprocess.call(bashCommand)
    
    #return the summary 
    with open(folder+'generated_sum.txt', 'r') as content_file:
        generated_sum = content_file.read()

    return generated_sum
    
    