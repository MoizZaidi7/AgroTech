from flask import Flask, request, jsonify
import numpy as np
import pickle
from pymongo import MongoClient
from datetime import datetime
from flask_cors import CORS

# Flask app setup
app = Flask(__name__)
CORS(app)

# Load models
model = pickle.load(open("model.pkl", "rb"))
sc = pickle.load(open("standscaler.pkl", "rb"))
ms = pickle.load(open("minmaxscaler.pkl", "rb"))

# MongoDB setup
try:
    client = MongoClient("mongodb+srv://Moiz:Moiz123@agrotech.mqmge.mongodb.net/")
    db = client.agrotech
    crop_recommendations_collection = db.croprecommendations
    print(f"Connected to MongoDB")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

@app.route('/api/predict', methods=["POST"])
def predict():
    try:
        data = request.json
        N = float(data["Nitrogen"])
        P = float(data["Phosphorus"])
        K = float(data["Potassium"])
        temp = float(data["Temperature"])
        humidity = float(data["Humidity"])
        ph = float(data["Ph"])
        rainfall = float(data["Rainfall"])

        feature_list = [N, P, K, temp, humidity, ph, rainfall]
        single_pred = np.array(feature_list).reshape(1, -1)

        # Scaling the features
        scaled_features = ms.transform(single_pred)
        final_features = sc.transform(scaled_features)
        prediction = model.predict(final_features)

        crop_dict = {
            1: "Rice", 2: "Maize", 3: "Jute", 4: "Cotton", 5: "Coconut", 6: "Papaya", 7: "Orange",
            8: "Apple", 9: "Muskmelon", 10: "Watermelon", 11: "Grapes", 12: "Mango", 13: "Banana",
            14: "Pomegranate", 15: "Lentil", 16: "Blackgram", 17: "Mungbean", 18: "Mothbeans",
            19: "Pigeonpeas", 20: "Kidneybeans", 21: "Chickpea", 22: "Coffee"
        }

        # Get crop name
        crop = crop_dict.get(prediction[0], "Unknown")

        # Save recommendation to MongoDB
        recommendation_data = {
            "Nitrogen": N,
            "Phosphorus": P,
            "Potassium": K,
            "Temperature": temp,
            "Humidity": humidity,
            "Ph": ph,
            "Rainfall": rainfall,
            "recommendedCrop": crop,
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