from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from hf_integration.hf_text_gen import generate_response

class ActionHuggingFaceResponse(Action):
    def name(self):
        return "action_huggingface_response"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        user_message = tracker.latest_message.get("text")

        # Generate response using Hugging Face model
        bot_response = generate_response(user_message)

        # Send response to user
        dispatcher.utter_message(text=bot_response)

        return []