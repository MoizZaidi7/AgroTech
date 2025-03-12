import requests
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher


class ActionHuggingfaceResponse(Action):
    def name(self) -> Text:
        return "action_huggingface_response"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Get the user's message
        user_message = tracker.latest_message.get('text')

        # Hugging Face API Key and Endpoint
        API_KEY = "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"
        API_URL = "https://api-inference.huggingface.co/models/gpt2"
        headers = {"Authorization": f"Bearer {API_KEY}"}

        # Send request to Hugging Face with improved parameters
        payload = {
            "inputs": user_message,
            "parameters": {
                "max_length": 50,  # Limit response length
                "min_length": 20,  # Ensure the response isn't too short
                "num_return_sequences": 1,
                "no_repeat_ngram_size": 2,  # Avoid repetitive phrases
                "temperature": 0.7,  # Controls randomness
                "top_p": 0.9  # Nucleus sampling for more relevant output
            }
        }

        try:
            response = requests.post(API_URL, headers=headers, json=payload)

            # Process response
            if response.status_code == 200:
                bot_reply = response.json()[0]['generated_text']
                # Limit the reply to 2 sentences for conciseness
                bot_reply = '. '.join(bot_reply.split('. ')[:2]) + '.'
            else:
                bot_reply = f"Sorry, I couldn’t process your request. Error: {response.status_code}"

        except requests.exceptions.RequestException as e:
            bot_reply = f"Failed to connect to Hugging Face API: {str(e)}"

        # Send the response back to the user
        dispatcher.utter_message(text=bot_reply)

        return []
