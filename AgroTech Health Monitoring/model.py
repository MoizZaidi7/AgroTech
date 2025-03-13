import torch
import torchvision.transforms as transforms
import torch.nn as nn
from torchvision import models
from PIL import Image
import os


class PlantDiseasePredictor:
    def __init__(self, model_path, dataset_path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Load the model
        self.model = models.vgg16(weights=None)
        state_dict = torch.load(model_path, map_location=self.device)
        state_dict = {k.replace("network.", ""): v for k, v in state_dict.items()}

        # Identify num_classes from classifier weights
        classifier_keys = [key for key in state_dict.keys() if "classifier" in key and "weight" in key]
        if classifier_keys:
            classifier_key = classifier_keys[-1]
            self.num_classes = state_dict[classifier_key].shape[0]
        else:
            raise KeyError("Could not find classifier weights in state_dict.")

        # Update classifier
        self.model.classifier[6] = nn.Linear(4096, self.num_classes)
        self.model.load_state_dict(state_dict, strict=False)
        self.model.to(self.device)
        self.model.eval()

        # Get class labels
        self.class_labels = self.get_class_labels(dataset_path)

    def get_class_labels(self, dataset_path):
        if os.path.exists(dataset_path):
            labels = sorted(os.listdir(dataset_path))
            return labels
        return [f"Class{i + 1}" for i in range(self.num_classes)]

    def get_image_transform(self):
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def predict_image(self, image_path):
        image = Image.open(image_path)
        image = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            output = self.model(image)
            _, predicted_class = torch.max(output, 1)
            predicted_label = self.class_labels[predicted_class.item()]

        if "_" in predicted_label:
            crop_name, status = predicted_label.split('_', 1)
            status = "Healthy" if "Healthy" in status else "Diseased"
        else:
            crop_name = predicted_label
            status = "Unknown"

        return f"{crop_name} - {status}"