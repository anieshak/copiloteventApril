from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# Load the delay chances model
model_file_path = '../models/flight_delay_model.pkl'
with open(model_file_path, 'rb') as model_file:
    delay_chances = pickle.load(model_file)

# Load the airports data
airports_file_path = '../data/airports.csv'
airports = pd.read_csv(airports_file_path)

@app.route('/predict_delay', methods=['GET'])
def predict_delay():
    """
    Endpoint to predict the chances of a flight delay.
    Accepts 'day_of_month', 'origin_airport_id', and 'dest_airport_id' as query parameters.
    Returns the delay chance and confidence percentage.
    """
    day_of_month = request.args.get('day_of_month', type=int)
    origin_airport_id = request.args.get('origin_airport_id', type=int)
    dest_airport_id = request.args.get('dest_airport_id', type=int)

    if day_of_month is None or origin_airport_id is None or dest_airport_id is None:
        return jsonify({"error": "Missing required query parameters"}), 400

    # Filter the delay chances DataFrame
    result = delay_chances[
        (delay_chances['DayofMonth'] == day_of_month) &
        (delay_chances['OriginAirportID'] == origin_airport_id) &
        (delay_chances['DestAirportID'] == dest_airport_id)
    ]

    if result.empty:
        return jsonify({"error": "No data found for the given parameters"}), 404

    delay_chance = result.iloc[0]['DelayChance']
    confidence = 100  # Assuming confidence is 100% as it's based on historical data

    return jsonify({
        "day_of_month": day_of_month,
        "origin_airport_id": origin_airport_id,
        "dest_airport_id": dest_airport_id,
        "delay_chance": delay_chance,
        "confidence": confidence
    })

@app.route('/airports', methods=['GET'])
def get_airports():
    """
    Endpoint to return the list of airport names and IDs, sorted alphabetically by name.
    """
    sorted_airports = airports.sort_values(by='OriginAirportName')
    airport_list = sorted_airports.to_dict(orient='records')

    return jsonify(airport_list)

if __name__ == '__main__':
    app.run(debug=True)