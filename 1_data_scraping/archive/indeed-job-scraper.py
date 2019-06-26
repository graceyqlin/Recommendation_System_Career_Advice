#!/usr/bin/python

import sys
from bs4 import BeautifulSoup
# from selenium import webdriver
# from selenium.common.exceptions import TimeoutException
import time
import requests
import random
import pandas as pd
import boto3
import botocore
import logging
from datetime import date, datetime, timedelta
import traceback
import csv



# Process one city at a time. In order to do so,
# get a distinct list of the resume ids for that city.
# Update the variables below for the city name.
resume_id_list = "job_id_list.csv"
out_file_name = "_job_data.csv"

def main():
    logging.basicConfig(filename="indeed-job-scraper.log", level=logging.INFO)

    with open(resume_id_list, 'r') as f:
        reader = csv.reader(f)
        job_ids = list(reader)

    for job_id in job_ids:
        city = job_id[0]
        job_id = job_id[4]
        
        sleep_non_bot()
        job_link_url = "https://www.indeed.com/viewjob?jk={}".format(job_id)
        print(job_link_url)
        logging.info("Scraping Job URL:{}".format(job_link_url))

        try:
            job_link_page = requests.get(job_link_url)
            job_link_soup = BeautifulSoup(job_link_page.text, "html.parser")
            job_title = job_link_soup.find(name="b", attrs={"class":"jobtitle"}).text
            job_company = job_link_soup.find(name="span", attrs={"class":"company"}).text
            job_city = job_link_soup.find(name="span", attrs={"class": "location"}).text
            job_summary = job_link_soup.find(name="span", attrs={"id": "job_summary"}).text.replace("\n", "\\n").encode('utf-8')
            combined_list = [job_title, job_company, job_city, job_summary]
            
            with open(city + out_file_name, 'a') as myfile:
                wr = csv.writer(myfile, quoting=csv.QUOTE_ALL)
                wr.writerow([job_id] + combined_list)

        except Exception as e:
            logging.error("Failed to scrape for resume id:{}".format(job_link_url))
            print(traceback.format_exc())
            continue


def log(msg):
    print(msg)
    logging.info(msg)


def sleep_non_bot():
    sleep_time = random.randint(1100,4000)/1000.0
    #print("Sleeping for time={} seconds".format(str(sleep_time)))
    logging.info("Sleeping for time={} seconds".format(str(sleep_time)))
    time.sleep(sleep_time) #waits for a random time so that the website don't consider you as a bot


# Usage: python indeed-scraper.py <search-term>
if __name__ == "__main__":
    main()
