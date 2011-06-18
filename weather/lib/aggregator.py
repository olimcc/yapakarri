#!/usr/bin/python2.4

"""Precipitation data interpreter.

  Reads and aggregates precipitation data from a csv file.
  Data is aggregated by year and by year-month, and written
  to two csv files accordingly.
  
  How to use:
  $ cd lib/
  $ python aggregator.py
  
  Output files will be written to:
  ../data/<<output_file>>
"""

__author__ = "dev@olimcc.com (Oliver McCormack)"

import csv
import sys
import datetime
import operator

YEARLY_FIELDNAMES = ('station_id', 'year', 'rained_days',
                     'total_days', 'precipitation', 'percent_rained',
                     'avg_precipitation', 'total_precipitation')
 
MONTHLY_FIELDNAMES = ('station_id', 'year', 'month','rained_days',
                      'total_days', 'precipitation', 'percent_rained',
                      'avg_precipitation', 'total_precipitation')

TIMESTAMP = datetime.datetime.now()

INPUT_FILENAME = '../data/wb-6160.csv'
YEARLY_OUTPUT_FILENAME = '../data/yearly.%s.csv' % (TIMESTAMP)
MONTHLY_OUTPUT_FILENAME = '../data/monthly.%s.csv' % (TIMESTAMP)   


def generateAggregatedDicts(raw_csv):
  """Generate yearly and monthly data from base data set.

  Creates two dictionaries holding aggregated precipitation data
  for yearly and monthly data respectively.

  Args:
    raw_csv: csv file holding three columns representing:
        station id, date, precipitation

  Returns:  
    A tuple holding two dictionaries (yearly_dict, monthly_dict)
    Each dictionary will hold the following data:
       station_id: integer representing station id
       rained_days: total number of days with rain in time frame
       total_days: total number of days in time frame
       precipitation: list of precipitations values, per day for time frame
       total_precipitation: sum of precipitation values for time frame
    In addition to this, yearly data will include:
      year: integer representing year
    Monthly data will include:
      year: integer representing year
      month: integer representing month
  """
  stations_yearly = {}
  stations_monthly = {}
  date_keys = {}
  
  # parse raw_data data, distribute to files
  for count, entry in enumerate(raw_csv):
    # simple progress
    if count % 500000 == 0:
      print count, 'rows read'
    
    station, date, precip = entry
    # treat N/A as null or 0.0
    if precip == 'NA':
      precip = 0.0
    precip = float(precip)
    
    year, month, day = date[:4], date[5:7], date[8:10]
    year_key = station+year
    month_key = station+year+month

    # handle yearly
    if year_key not in stations_yearly:
      stations_yearly[year_key] = {
        'station_id': None,
        'year': None,
        'rained_days': 0,
        'total_days': 0,
        'precipitation': [],
        'total_precipitation': 0.0
      }
    stations_yearly[year_key]['station_id'] = station
    stations_yearly[year_key]['year'] = year 
    stations_yearly[year_key]['total_days'] += 1
    stations_yearly[year_key]['precipitation'].append(precip)
    stations_yearly[year_key]['total_precipitation']+=precip
    if precip > 0:
      stations_yearly[year_key]['rained_days'] += 1
      
    # handle monthly
    if month_key not in stations_monthly:
      stations_monthly[month_key] = {
        'station_id': None,
        'year': None,
        'rained_days': 0,
        'total_days': 0,
        'precipitation': [],
        'total_precipitation': 0.0
      }
    stations_monthly[month_key]['station_id'] = station
    stations_monthly[month_key]['year'] = year
    stations_monthly[month_key]['month'] = month
    stations_monthly[month_key]['total_days'] += 1
    stations_monthly[month_key]['precipitation'].append(precip)
    stations_monthly[month_key]['total_precipitation']+=precip
    if precip > 0:
      stations_monthly[month_key]['rained_days'] += 1 
  return (stations_yearly, stations_monthly)
  
  
def addComputedColumns(result_dict):
  """Adds some computed columns to our aggregation dicts for easy lookup.
  
  Args:
    result_dict: A dictionary of aggregated precipitation data
  Returns:
    The augmented dictionary, now including:
      percent_rained: float representing percentage of days with rain
          in timeframe
      avg_precipitation: float representing average precipitation for
          time frame
  """
  for entry in result_dict.values():
    entry['percent_rained'] = float(entry['rained_days'])/float(entry['total_days'])
    entry['avg_precipitation'] = sum(entry['precipitation'])/len(entry['precipitation'])
  return result_dict
 
    
def writeToCsv(csv_obj, rows_list, field_names):
  """Writes file to output csv.

  Args:
    csv_obj: A CSV file object
    rows_list: List of dicts to write to csv
    field_names: List of headers for csv
  """
  csv_obj.writer.writerow(field_names)
  for entry in rows_list:
    csv_obj.writerow(entry)


def main():
  """Main."""
  # input csv
  try:
    raw_csv = csv.reader(open(INPUT_FILENAME, 'r'))
  except IOError:
    print 'could not find "../data/wb-6160.csv"\nexiting.' 
    sys.exit()
 
  stations_yearly, stations_monthly = generateAggregatedDicts(raw_csv)
  stations_yearly = addComputedColumns(stations_yearly)
  stations_monthly = addComputedColumns(stations_monthly)
  
  # output files      
  yearly_csv = csv.DictWriter(
      open(YEARLY_OUTPUT_FILENAME, 'w'),
      YEARLY_FIELDNAMES)
  monthly_csv = csv.DictWriter(
      open(MONTHLY_OUTPUT_FILENAME, 'w'),
      MONTHLY_FIELDNAMES)

  # write out
  writeToCsv(yearly_csv, stations_yearly.values(), YEARLY_FIELDNAMES)
  print 'yearly complete'
  writeToCsv(monthly_csv, stations_monthly.values(), MONTHLY_FIELDNAMES)
  print 'monthly complete'

if __name__ == "__main__":
  main()