from transformers import pipeline

# Define the model to use
MODEL_NAME = "facebook/blenderbot-400M-distill"  # Change this to a different model if needed

def load_hf_model():
    print(f"⏳ Loading Hugging Face model: {MODEL_NAME}")
    model_pipeline = pipeline("text2text-generation", model=MODEL_NAME)
    print("✅ Model loaded successfully!")
    return model_pipeline