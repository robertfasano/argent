from argent.conversion import convert_to_dataframe

def analyze(data, durations, delays):
    df = convert_to_dataframe(data, durations, delays)
    print(df)
