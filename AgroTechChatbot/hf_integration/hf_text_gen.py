from hf_model_download import load_hf_model

# Load the model
text_generator = load_hf_model()


def generate_response(prompt):
    """
    Generates a response using a Hugging Face transformer model.

    Args:
        prompt (str): User input text

    Returns:
        str: Generated chatbot response
    """
    response = text_generator(prompt, max_length=100, do_sample=True)
    return response[0]["generated_text"]