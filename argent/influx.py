import datetime, pytz
import influxdb_client
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import timedelta
import pandas as pd

class InfluxDBClient:
    def __init__(self, config, debug=False):
        self.client = influxdb_client.InfluxDBClient(url=f'http://{config["addr"]}', 
                                                     token=config['token'], 
                                                     org=config["org"],
                                                     debug=debug)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.query_api = self.client.query_api()
        self.timezone = config['timezone']
        self.bucket = config['bucket']

    def write(self, df):        
        now = datetime.datetime.now(pytz.timezone(self.timezone))
        tz_offset = now.utcoffset().total_seconds()/60/60
        df.index -= timedelta(hours=tz_offset)

        self.write_api.write(self.bucket, 
                             record=df, 
                             data_frame_measurement_name='artiq', 
                             data_frame_tag_columns=['__stage__', '__run__'], 
                             time_precision='us')

    def query(self, *fields, start='-1m', stop='0m'):
        data = None
        for field in fields:
            result = self.query_api.query_data_frame(f'from(bucket:"{self.bucket}") |> range(start: {start}, stop: {stop}) |> filter(fn: (r) => r["_field"] == "{field}")')
            if data is None:
                data = pd.DataFrame(result['_value'].values, columns=[field], index=result['_time'])
            else:
                data[field] = result['_value'].values
        return data

    def time(self):
        ''' Returns the timestamp of the last data point (within 1 hour) '''
        return self.api.query_data_frame(f'from(bucket:"{self.bucket}") |> range(start: -1h) |> tail(n: 1)')[-1]['_time'].iloc[-1]
