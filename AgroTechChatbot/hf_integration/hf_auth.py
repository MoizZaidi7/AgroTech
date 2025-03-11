import os
from huggingface_hub import login

# Load API key from environment variable
HF_API_KEY = os.getenv("HF_API_KEY")

def authenticate_huggingface():
    if HF_API_KEY:
        login(token=HF_API_KEY)
        print("✅ Hugging Face authentication successful.")
    else:
        print("❌ Hugging Face API key not found. Set HF_API_KEY as an environment variable.")
