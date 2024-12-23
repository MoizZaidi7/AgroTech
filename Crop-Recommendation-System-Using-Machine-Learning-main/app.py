from flask import Flask, request, jsonify
import numpy as np
import pickle
from pymongo import MongoClient
from datetime import datetime
from flask_cors import CORS
import requests

# Flask app setup
app = Flask(__name__)
CORS(app)

# Load models
try:
    model = pickle.load(open("model.pkl", "rb"))
    print(f"Model loaded: {type(model)}")  # Debug print
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Load scalers
try:
    sc = pickle.load(open("standscaler.pkl", "rb"))
    ms = pickle.load(open("minmaxscaler.pkl", "rb"))
except Exception as e:
    print(f"Error loading scalers: {e}")
    sc = ms = None

# MongoDB connection
try:
    client = MongoClient("mongodb+srv://Moiz:Moiz123@agrotech.mqmge.mongodb.net/")
    db = client.agrotech
    crop_recommendations_collection = db.croprecommendations
    print("Connected to MongoDB")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Geocoding function to convert location to latitude and longitude using OpenCage API
def get_latitude_longitude(location):
    geocode_url = "https://api.opencagedata.com/geocode/v1/json"
    params = {
        "q": location,
        "key": "4dcfa6259a9f4a0cb013f631eb02df50",  # Replace with your OpenCage API key
        "no_annotations": 1,
    }
    response = requests.get(geocode_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data["results"]:
            latitude = data["results"][0]["geometry"]["lat"]
            longitude = data["results"][0]["geometry"]["lng"]
            return latitude, longitude
        else:
            return None, None
    else:
        return None, None

@app.route('/api/predict', methods=["POST"])
def predict():
    if model is None or sc is None or ms is None:
        return jsonify({
            "success": False,
            "message": "Model or Scalers not loaded properly"
        }), 500

    try:
        data = request.json
        N = float(data["Nitrogen"])
        P = float(data["Phosphorus"])
        K = float(data["Potassium"])
        ph = float(data["Ph"])
        rainfall = float(data["Rainfall"])
        location = data["location"]  # User input location (e.g., city name or address)

        # Get latitude and longitude from location using OpenCage Geocoding API
        latitude, longitude = get_latitude_longitude(location)

        if latitude is None or longitude is None:
            return jsonify({
                "success": False,
                "message": "Failed to get latitude and longitude for the given location"
            }), 400

        # Fetch current weather data from Open-Meteo using the fetched latitude and longitude
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": ["temperature_2m", "relative_humidity_2m"]
        }

        response = requests.get(url, params=params)
        if response.status_code == 200:
            weather_data = response.json()
            temp = weather_data["current"]["temperature_2m"]
            humidity = weather_data["current"]["relative_humidity_2m"]
        else:
            return jsonify({
                "success": False,
                "message": "Failed to fetch weather data from Open-Meteo"
            }), 500

        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)

        # Scaling the features
        scaled_features = ms.transform(single_pred)
        final_features = sc.transform(scaled_features)
        prediction = model.predict(final_features)

        crop_dict = {
            1: {"name": "Rice", "image": "rice.jpg"},
            2: {"name": "Maize", "image": "maize.jpg"},
            3: {"name": "Jute", "image": "jute.jpg"},
            4: {"name": "Cotton", "image": "Cotton.jpg"},
            5: {"name": "Coconut", "image": "Coconut.jpg"},
            6: {"name": "Papaya", "image": "papaya.jpg"},
            7: {"name": "Orange", "image": "orange.jpg"},
            8: {"name": "Apple", "image": "apple.jpg"},
            9: {"name": "Muskmelon", "image": "muskmelon.jpg"},
            10: {"name": "Watermelon", "image": "Watermelon.jpg"},
            11: {"name": "Grapes", "image": "grapes.jpg"},
            12: {"name": "Mango", "image": "Mango.jpg"},
            13: {"name": "Banana", "image": "banana.jpg"},
            14: {"name": "Pomegranate", "image": "pomegranate.jpg"},
            15: {"name": "Lentil", "image": "lentil.jpg"},
            16: {"name": "Blackgram", "image": "blackgram.jpg"},
            17: {"name": "Mungbean", "image": "mungbean.jpg"},
            18: {"name": "Mothbeans", "image": "mothbeans.jpg"},
            19: {"name": "Pigeonpeas", "image": "Pigeonpeas.jpg"},
            20: {"name": "Kidneybeans", "image": "kidneybeans.jpg"},
            21: {"name": "Chickpea", "image": "chickpea.jpg"},
            22: {"name": "Coffee", "image": "coffee.jpg"}
        }

        # Get crop name and image
        crop_info = crop_dict.get(prediction[0], {"name": "Unknown", "image": "unknown.jpg"})
        crop_name = crop_info["name"]
        crop_image = crop_info["image"]

        # Save recommendation to MongoDB
        recommendation_data = {
            "Nitrogen": N,
            "Phosphorus": P,
            "Potassium": K,
            "Temperature": temp,
            "Humidity": humidity,
            "Ph": ph,
            "Rainfall": rainfall,
            "location": location,
            "latitude": latitude,
            "longitude": longitude,
            "recommendedCrop": crop_name,
            "cropImage": f"/static/images/{crop_image}",  # Include image path
            "createdAt": datetime.utcnow(),
        }

        crop_recommendations_collection.insert_one(recommendation_data)

        # Ensure that the _id is returned as a string (not ObjectId)
        recommendation_data["_id"] = str(recommendation_data["_id"])

        return jsonify({
            "success": True,
            "message": "Crop recommendation saved successfully",
            "data": recommendation_data
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error occurred: {str(e)}"
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
