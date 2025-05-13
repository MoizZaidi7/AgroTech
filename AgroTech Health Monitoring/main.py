
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torchvision.transforms as transforms
import torch.nn as nn
from torchvision import models
from PIL import Image
import os
import zipfile

# ====== Paths ======
ZIP_PATH = "C:\\Users\\A.C\\OneDrive\\Documents\\GitHub\\Agrotech\\AgroTech Health Monitoring\\New Plant Disease DataSet.zip"
DATASET_PATH = "C:\\Users\\A.C\\OneDrive\\Pictures\\train\\New Plant Diseases Dataset(Augmented)\\New Plant Diseases Dataset(Augmented)\\train"
MODEL_PATH = "C:\\Users\\A.C\\OneDrive\\Documents\\GitHub\\Agrotech\\AgroTech Health Monitoring\\vgg_ft_model.pth"

# ====== Unzipping Dataset ======
def unzip_dataset(zip_path, extract_path):
    if not os.path.exists(extract_path):  # Only unzip if not already extracted
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        print("Dataset unzipped successfully!")

unzip_dataset(ZIP_PATH, DATASET_PATH)

# ====== Load Model ======
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = models.vgg16(pretrained=False)
state_dict = torch.load(MODEL_PATH, map_location=device)

# Fix potential key mismatch
state_dict = {k.replace("network.", ""): v for k, v in state_dict.items()}

# Identify classifier layer dynamically
classifier_keys = [key for key in state_dict.keys() if "classifier" in key and "weight" in key]
if classifier_keys:
    classifier_key = classifier_keys[-1]
    num_classes = state_dict[classifier_key].shape[0]
else:
    raise KeyError("Could not find classifier weights in state_dict.")

# Update classifier layer dynamically
model.classifier[6] = nn.Linear(4096, num_classes)
model.load_state_dict(state_dict, strict=False)  # Allow missing keys
model.to(device)
model.eval()

# ====== Extract Class Labels ======
def get_class_labels(dataset_path):
    if os.path.exists(dataset_path):
        labels = sorted(os.listdir(dataset_path))
        return labels
    return [f"Class{i + 1}" for i in range(num_classes)]  # Fallback

class_labels = get_class_labels(DATASET_PATH)

# ====== Image Preprocessing ======
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# ====== Prediction Function ======
def predict_image(image_path, threshold=0.75):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(image)
        probabilities = torch.softmax(output, dim=1)
        max_prob, predicted_class = torch.max(probabilities, 1)
        predicted_label = class_labels[predicted_class.item()]

    # Debugging: Log probabilities and predicted label
    print("Probabilities:", probabilities)
    print(f"Predicted Label: {predicted_label}, Confidence: {max_prob.item():.2f}")

    # Extract crop name and health status
    if "___" in predicted_label:
        crop_name, status = predicted_label.split("___", 1)
    else:
        crop_name = predicted_label
        status = "Unknown"

    # Check if it's healthy or diseased
    if "healthy" in status.lower():
        status = "Healthy"
    else:
        status = "Diseased"

    # Handle low-confidence predictions
    if max_prob.item() < threshold:
        status = "Uncertain (Possibly Healthy)"

    print(f"Predicted Crop: {crop_name}, Condition: {status}")
    return f"{crop_name} - {status} (Confidence: {max_prob.item():.2f})"



# ====== Flask App Setup ======
app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    temp_file_path = "./temp_image.jpg"

    file.save(temp_file_path)

    try:
        result = predict_image(temp_file_path)
        return jsonify({"prediction": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

# ====== Run Flask App ======
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)
