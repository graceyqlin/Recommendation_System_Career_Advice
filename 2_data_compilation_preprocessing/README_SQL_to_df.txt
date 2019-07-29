This ReadMe describes how to pull the final dataset from the Google Cloud MySQL Database into a local Python dataframe.

* make sure pymysql is installed
* make sure you have pulled in the capstone-246802-9f2e5fab043c.JSON credential file and know its path

1) Download the proxy client: 

curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64

2) Make the proxy executable:

chmod +x cloud_sql_proxy

3) Start the proxy: (the instance name should not change but you will need to change the path to wherever you stored the credential file)

./cloud_sql_proxy -instances=capstone-246802:us-central1:capstonecareeradvice=tcp:3306 \
                  -credential_file=~/Documents/MIDS/Capstone/mids-capstone-careeradvice/capstone-246802-9f2e5fab043c &

4) In Python, add these lines of code to pull in the dataset:

import pymysql
import pandas as pd

connection = pymysql.connect(host='127.0.0.1',
                             user='root',
                             password='capstone',
                             db='capstone')

query = "SELECT * FROM QA_FINAL"
df = pd.read_sql(query, connection)

5) Run the code and df will contain your final dataset. (Note it takes 7-8 minutes to pull the data in)
