import pandas as pd
import pymysql

connection = pymysql.connect(host='35.226.35.190',
                             user='root',
                             password='capstone',
                             db='capstone')

query = '''
SELECT * 
FROM oes_stats s 
JOIN (
    SELECT DISTINCT LEFT(cod,7) as soc
    FROM career_clusters  
    WHERE pathway = '{}'
) c
ON s.soc = c.soc
;
'''


def get_cluster_data(pathway):
    q = query.format(pathway)
    df = pd.read_sql(q, connection)
    out = [x for x in df.T.to_dict().values()]
    return out
