import sys
import os
import struct
import subprocess
import collections
import tensorflow as tf
import pandas as pd
from tensorflow.core.example import example_pb2
from sklearn.model_selection import train_test_split


dm_single_close_quote = u'\u2019' # unicode
dm_double_close_quote = u'\u201d'
END_TOKENS = ['.', '!', '?', '...', "'", "`", '"', dm_single_close_quote, dm_double_close_quote, ")"] # acceptable ways to end a sentence

# We use these to separate the summary sentences in the .bin datafiles
SENTENCE_START = '<s>'
SENTENCE_END = '</s>'



# These are the number of .story files we expect there to be in cnn_stories_dir and dm_stories_dir
#num_expected_cnn_stories = 92579
#num_expected_dm_stories = 219506

VOCAB_SIZE = 200000
CHUNK_SIZE = 1000 # num examples per chunk, for the chunked data
working_dir = '/home/final/pointer-generator-master/temp_sum/'

def tokenize_stories(directory):
  """Maps a whole directory of .story files to a tokenized version using Stanford CoreNLP Tokenizer"""
  #print("Preparing to tokenize %s to %s..." % (stories_dir, tokenized_stories_dir))
  # stories = os.listdir(directory)
  # make IO list file
  #print("Making list of files to tokenize...")
  with open("mapping.txt", "w+") as f:
      f.write("%s \t %s\n" % (working_dir+'text_to_summarize.txt', working_dir+'text_to_summarize_token.txt'))
  command = ['java', 'edu.stanford.nlp.process.PTBTokenizer', '-ioFileList', '-preserveLines', 'mapping.txt']
  # command = ['java','edu.stanford.nlp.process.PTBTokenizer','-preserveLines',working_dir+'text_to_summarize.txt','>',working_dir+'text_to_summarize_token.txt']
  #print("Tokenizing %i files in %s and saving in %s..." % (len(stories), stories_dir, tokenized_stories_dir))
  subprocess.call(command)
  #print("Stanford CoreNLP Tokenizer has finished.")
  os.remove("mapping.txt")

def write_text_to_file(data_text):
    with open(working_dir+"text_to_summarize.txt", "w") as text_file:
        text_file.write(data_text)

def read_text_file(text_file):
  lines = []
  with open(text_file, "r") as f:
    for line in f:
      lines.append(line.strip())
  return lines

def fix_missing_period(line):
  """Adds a period to a line that is missing a period"""
  if "@highlight" in line: return line
  if line=="": return line
  if line[-1] in END_TOKENS: return line
  # print line[-1]
  return line + ". "


def get_art_abs(story_file):
  lines = read_text_file(story_file)

  # Lowercase everything
  lines = [line.lower() for line in lines]

  # Put periods on the ends of lines that are missing them (this is a problem in the dataset because many image captions don't end in periods; consequently they end up in the body of the article as run-on sentences)
  lines = [fix_missing_period(line) for line in lines]

  # Separate out article and abstract sentences
  article_lines = []
  highlights = []
  next_is_highlight = False
  for idx,line in enumerate(lines):
    if line == "":
      continue # empty line
    elif line.startswith("@highlight"):
      next_is_highlight = True
    elif next_is_highlight:
      highlights.append(line)
    else:
      article_lines.append(line)

  # Make article into a single string
  article = ' '.join(article_lines)

  # Make abstract into a signle string, putting <s> and </s> tags around the sentences
  abstract = ' '.join(["%s %s %s" % (SENTENCE_START, sent, SENTENCE_END) for sent in highlights])

  return article, abstract


def write_to_bin(data_file, out_file, makevocab=False):
  """Reads the tokenized .story files corresponding to the urls listed in the url_file and writes them to a out_file."""

  with open(out_file, 'wb') as writer:
      #print('*******************************')
      #print(file)
      # Get the strings to write to .bin file
      article, abstract = get_art_abs(data_file)

      # Write to tf.Example
      tf_example = example_pb2.Example()
      tf_example.features.feature['article'].bytes_list.value.extend([article.encode('utf-8')])
      tf_example.features.feature['abstract'].bytes_list.value.extend([abstract.encode('utf-8')])
      tf_example_str = tf_example.SerializeToString()
      str_len = len(tf_example_str)
      writer.write(struct.pack('q', str_len))
      writer.write(struct.pack('%ds' % str_len, tf_example_str))


    
def make_summarization_data(input_string_list):
  #Create word file
  write_text_to_file(input_string_list)
  #Tokenize created file
  tokenize_stories(working_dir)

  # Read the tokenized stories, do a little postprocessing then write to bin files
  write_to_bin(os.path.join(working_dir,'text_to_summarize_token.txt'), os.path.join(working_dir, "temp.bin"))
