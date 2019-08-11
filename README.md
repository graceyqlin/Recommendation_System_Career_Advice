# mids-capstone-careeradvice
## Background
**This work was done for the Capstone Project in the Masters in Information and Data Science at the University of California, Berkeley by Lucy Xie, Andrew Kabatznick, Jim Bauserman, and Grace Lin.**

**A brief background of our work and a snapshot of the running final web app and model can be found here: [Career Advice Recommendation System (CARS)](https://jimbauserman.github.io/mids-capstone-careeradvice/)**
**Table of Contents**

[TOCM]

[TOC]

## Summarization Model
### Background

Our Summarization Model leverages the work by Abigail See and team in their 2017 ACL Paper: “Get To The Point: Summarization with Pointer-Generator Networks”. The original work can be found here: ["Get To The Point"](https://github.com/abisee/pointer-generator).

### Set Up Instructions
1.	Make sure java is Installed:
`$ sudo apt install default-jre`
2. Set Up Model Files:
	 1.  Within the <span style="color:red">*"4_similarity_and_summarization//summarization_model/log/combined_files/train"*</span> Directory:
		1. vi checkpoint
		 	1.	Update the first line:
				1.	model_checkpoint_path: "<span style="color:red">*{Path to Train Directory}"*</span>/model.ckpt-65193"
		2.  Unzip the model
		`$ unzip model.ckpt-65193.data-00000-of-00001.zip`  
	 2.  Within the <span style="color:red">*"4_similarity_and_summarization//summarization_model/model_generator_files"*</span> Directory
		 1. `$ vi  RunOneSummary.py`
		 	 1.  Update line 9: 
			 	1. `folder = `<span style="color:red">*‘{Path to Temp Sum Directory}*</span>
		 	 1.  Update line 24: 
			 	1. `bashCommand = ['python', `<span style="color:red">*‘{Path to Model Generator Files}*</span>`/run_summarization_capstone.py']` 
		 1.  `$ vi  make_data_for_summarization.py`
		 	 1.  Update the line 28 
			 	1. `folder = `<span style="color:red">*"{Path to Temp Sum Directory}"*</span>
		 1.  `$ vi run_summarization_capstone.py`
		 	 1.  Update line 45 
			 	1. `tf.app.flags.DEFINE_string('data_path', '`<span style="color:red">*"{Path to Temp Sum Directory}"*</span>`/temp.bin', 'Path expression to tf.Example datafiles. Can include wildcards to access multiple datafiles.')`
		 	 1.  Update line 47 
			 	1. `tf.app.flags.DEFINE_string('vocab_path', '`<span style="color:red">*"{Path to summarization_model/vocab/final_model_vocab}"*</span>`/vocab', ''Path expression to text vocabulary file.')`
		 	 1.  Update line 54 
			 	1. `tf.app.flags.DEFINE_string('log_root', '`<span style="color:red">*"{Path to summarization_model/log}"*</span>`', 'Root directory for all logging.')`
3. Set Up Stanford Files:
	1. Navigate to <span style="color:red">*mids-capstone-careeradvice/4_similarity_and_summarization/summarization_model/*</span> path
	1. `$ unzip stanford-corenlp-full-2018-10-05.zip`
	2. Set up Stanford Path
		1. Run the following: `$ vi ~/.profile`
			1. Add the following line to the end of the file:
				1. `export CLASSPATH=`<span style="color:red">*{location of Unzipped Stanford Model}*</span> `/stanford-corenlp-3.9.2.jar`
		1. Run the following: `source ~/.profile`

