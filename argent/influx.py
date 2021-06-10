
import influxdb_client
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import timedelta
class InfluxDBClient:
    def __init__(self, config, debug=False):
        self.client = influxdb_client.InfluxDBClient(url=f'http://{config["addr"]}', 
                                                     token=config['token'], 
                                                     org=config["org"],
                                                     debug=debug)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.timezone = config['timezone']

    def write(self, df, bucket):
        df.index += timedelta(hours=self.timezone)
        self.write_api.write(bucket, 
                             record=df, 
                             data_frame_measurement_name='artiq', 
                             data_frame_tag_columns=['__stage__', '__run__'], 
                             time_precision='us')