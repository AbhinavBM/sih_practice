from flask import Flask, request, jsonify, Response
import io
import speech_recognition as sr
import pyttsx3
import googletrans
from googletrans import Translator

app = Flask(__name__)

# Initialize the recognizer and text-to-speech engine
recognizer = sr.Recognizer()
engine = pyttsx3.init()
trans = Translator()

# Function to recognize and translate audio (same as before)

# Define the root route
@app.route('/')
def home():
    return "Welcome to the Audio Processing API"

# Route to process audio
@app.route('/process_audio', methods=['POST'])
def process_audio():
    try:
        # Get the audio data from the POST request
        audio_data = request.data

        # Call the function to recognize and translate audio (same as before)
        output_audio_data = recognize_and_translate(audio_data)

        if output_audio_data:
            # Return the audio data as a response
            return Response(output_audio_data, mimetype="audio/wav")
        else:
            return jsonify({"error": "Audio processing failed"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
