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
import json
import logging
from datetime import date, datetime, timedelta
import traceback
import csv

# Update this with the list of locations and radiuses.
# Locations with fewer records need larger radiuses.
# This function creates a csv with all the relevant 
# resume ids. We will then use these resume ids to get
# the resume content for each resume. This is broken
# into 2 steps so we can restart the system if the 
# connection breaks. This function requires jobtitles.txt
# in order to determine which jobs to scrape.
locations = {
"Washington%2C+DC":25,
"Atlanta%2C+GA":25,
"Denver%2C+CO":50,
"New+York%2C+NY":25,
"Minneapolis%2C+MN":25
}


def main():
    logging.basicConfig(filename="indeed-id-scraper.log", level=logging.INFO)
    with open('jobtitles.txt') as f:
        jobtitles = f.readlines()
    jobtitles = [x.strip() for x in jobtitles]

    num_search_results = 100

    for location in locations:
        for job in jobtitles:
            for page_number in range(0,1000,50):
                if page_number == 0: page_number = 1

                if num_search_results < page_number:
                    break

                radius = locations[location]
                job = job.replace(" ", "+")
                sleep_non_bot()
                log("Search:{} in Location:{} within Radius:{} at Start Page:{}" \
                                .format(job, location, str(radius), page_number))
                search_url = "https://www.indeed.com/resumes?q={}&l={}&co=US&radius={}&start={}"\
                .format(job, location, str(radius), page_number)
                print(search_url)

                # Create soup of search page
                try:
                    search_page = requests.get(search_url)
                    soup = BeautifulSoup(search_page.text, "html.parser")
                    # Get count of results
                    num_search_results = int(soup.find(id = 'result_count').string.replace(',', '').strip().split(" ")[0])

                    resume_ids = []
                    for div in soup.find_all(name="input", attrs={"name":"rez"}):
                        resume_ids.append(div["value"])

                    with open("resume_id_list.csv", 'a') as myfile:
                        wr = csv.writer(myfile, quoting=csv.QUOTE_ALL)
                        for resume_id in resume_ids:
                            wr.writerow([location, radius, job, page_number, str(resume_id)])

                except Exception as e:
                    logging.error("Failed to scrape for search results:{}".format(search_url))
                    print(traceback.format_exc())
                    continue


def log(msg):
    print(msg)
    logging.info(msg)


def sleep_non_bot():
    sleep_time = random.randint(2100,4000)/1000.0
    #print("Sleeping for time={} seconds".format(str(sleep_time)))
    logging.info("Sleeping for time={} seconds".format(str(sleep_time)))
    time.sleep(sleep_time) #waits for a random time so that the website don't consider you as a bot


if __name__ == "__main__":
    main()
