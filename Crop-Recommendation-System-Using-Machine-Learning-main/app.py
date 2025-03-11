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
    print(f"✅ Model loaded: {type(model)}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Load scalers
try:
    sc = pickle.load(open("standscaler.pkl", "rb"))
    ms = pickle.load(open("minmaxscaler.pkl", "rb"))
except Exception as e:
    print(f"❌ Error loading scalers: {e}")
    sc = ms = None

# MongoDB connection
try:
    client = MongoClient("mongodb+srv://Moiz:Moiz123@agrotech.mqmge.mongodb.net/")
    db = client.agrotech
    crop_recommendations_collection = db.croprecommendations
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ Error connecting to MongoDB: {e}")

# API Keys (Replace with your own)
GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"
OPENCAGE_API_KEY = "YOUR_OPENCAGE_API_KEY"


def reverse_geocode(lat, lng):
    """Convert coordinates into a location name using Google Maps API"""
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={GOOGLE_MAPS_API_KEY}"
    response = requests.get(url)
    data = response.json()

    if data['status'] == 'OK':
        return data['results'][0]['formatted_address']
    return None


def get_latitude_longitude(location):
    """Convert location name into latitude and longitude using OpenCage API"""
    url = "https://api.opencagedata.com/geocode/v1/json"
    params = {"q": location, "key": OPENCAGE_API_KEY, "no_annotations": 1}
    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        if data["results"]:
            return data["results"][0]["geometry"]["lat"], data["results"][0]["geometry"]["lng"]
    return None, None


@app.route('/api/predict', methods=["POST"])
def predict():
    if model is None or sc is None or ms is None:
        return jsonify({"success": False, "message": "Model or scalers not loaded properly"}), 500

    try:
        data = request.json
        N = float(data["Nitrogen"])
        P = float(data["Phosphorus"])
        K = float(data["Potassium"])
        ph = float(data["Ph"])
        rainfall = float(data["Rainfall"])
        location = data["location"]

        # Handle location: Either address or coordinates
        if isinstance(location, dict) and "lat" in location and "lng" in location:
            latitude, longitude = location["lat"], location["lng"]
            location = reverse_geocode(latitude, longitude)  # Convert coords to readable address
        else:
            latitude, longitude = get_latitude_longitude(location)  # Convert address to coords

        if latitude is None or longitude is None:
            return jsonify({"success": False, "message": "Invalid location data"}), 400

        # Fetch weather data from Open-Meteo API
        weather_url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": ["temperature_2m", "relative_humidity_2m"]
        }
        response = requests.get(weather_url, params=params)
        if response.status_code == 200:
            weather_data = response.json()
            temp = weather_data["current"]["temperature_2m"]
            humidity = weather_data["current"]["relative_humidity_2m"]
        else:
            return jsonify({"success": False, "message": "Failed to fetch weather data"}), 500

        # Feature processing
        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)
        scaled_features = ms.transform(single_pred)
        final_features = sc.transform(scaled_features)
        prediction = model.predict(final_features)

        # Crop dictionary
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
            "cropImage": f"/static/images/{crop_image}",
            "createdAt": datetime.utcnow(),
        }

        crop_recommendations_collection.insert_one(recommendation_data)
        recommendation_data["_id"] = str(recommendation_data["_id"])

        return jsonify({"success": True, "message": "Crop recommendation saved", "data": recommendation_data}), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error occurred: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
