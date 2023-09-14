from flask import Flask, request, jsonify, Response
from flask_cors import CORS  # Import the CORS extension

app = Flask(__name__)
CORS(app)  # Enable CORS for your Flask app

# Function to process audio (replace with your actual audio processing logic)
def process_audio(audio_data):
    # Replace this with your audio processing logic
    # For this example, we'll just return the input audio data as-is
    return audio_data

# Root route
@app.route('/')
def home():
    return "Welcome to the Audio Processing API"

# Route to process audio
@app.route('/process_audio', methods=['POST'])
def process_audio_route():
    try:
        # Get the audio data from the POST request
        audio_data = request.data

        # Call the function to process audio
        processed_audio_data = process_audio(audio_data)

        if processed_audio_data:
            # Return the processed audio data as a response
            return Response(processed_audio_data, mimetype="audio/wav")
        else:
            return jsonify({"error": "Audio processing failed"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
