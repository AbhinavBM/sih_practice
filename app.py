from flask import Flask, request, jsonify, Response, send_from_directory, render_template
from flask_cors import CORS  # Import the CORS extension
from werkzeug.utils import secure_filename
import os
import shutil

app = Flask(__name__)
CORS(app)  # Enable CORS for your Flask app

# Directory to store uploaded audio files and processed audio files
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER

# Function to process audio (replace with your actual audio processing logic)
def process_audio(audio_data):
    # Replace this with your audio processing logic
    # For this example, we'll just return the input audio data as-is
    return audio_data

# Custom 404 error handler
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404

# Route for the home page
@app.route('/')
def home():
    return jsonify({"message": "This is an API for audio processing"})

# Route to process audio
@app.route('/process_audio', methods=['POST'])
def process_audio_route():
    try:
        # Check if the POST request has the "audioFile" part
        if 'audioFile' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audioFile']

        # Check if the file is empty
        if audio_file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Save the uploaded audio file securely
        filename = secure_filename(audio_file.filename)
        upload_filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        audio_file.save(upload_filepath)

        # Read the uploaded audio file as binary data
        with open(upload_filepath, 'rb') as audio_data:
            processed_audio_data = process_audio(audio_data.read())

        if processed_audio_data:
            # Save the processed audio file securely
            processed_filename = f"processed_{filename}"
            processed_filepath = os.path.join(app.config['PROCESSED_FOLDER'], processed_filename)

            with open(processed_filepath, 'wb') as processed_file:
                processed_file.write(processed_audio_data)

            # Return the processed audio data as a response
            return Response(processed_audio_data, mimetype="audio/wav")

        else:
            return jsonify({"error": "Audio processing failed"}), 500

    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Serve the processed audio file
@app.route('/processed/<filename>')
def processed_file(filename):
    processed_filepath = os.path.join(app.config['PROCESSED_FOLDER'], filename)

    if os.path.exists(processed_filepath):
        return send_from_directory(app.config['PROCESSED_FOLDER'], filename)
    else:
        return jsonify({"error": "Processed file not found"}), 404

if __name__ == '__main__':
    # Create the processed directory if it doesn't exist
    processed_dir = app.config['PROCESSED_FOLDER']
    if not os.path.exists(processed_dir):
        os.makedirs(processed_dir)

    app.run(debug=True)
