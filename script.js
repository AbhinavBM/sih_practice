// Import Axios for making HTTP requests
import axios from 'axios';

document.addEventListener("DOMContentLoaded", function () {
    // Get references to HTML elements
    const audioUploadForm = document.getElementById("audioUploadForm"); // Get the audio upload form
    const responseMessage = document.getElementById("responseMessage"); // Get the response message container
    const startRecordingButton = document.getElementById("startRecording"); // Get the "Start Recording" button (modified)
    const stopRecordingButton = document.getElementById("stopRecording"); // Get the "Stop Recording" button
    const playAudioButton = document.getElementById("playAudio"); // Get the "Play Audio" button

    let mediaRecorder; // Variable to store the MediaRecorder
    let audioChunks = []; // Array to store audio chunks
    let processedAudioBlob; // Blob to store processed audio data

    // Function to start audio recording (modified)
    function startRecording() {
        startRecordingButton.disabled = true; // Disable "Start Recording" button
        stopRecordingButton.disabled = false; // Enable "Stop Recording" button
        audioChunks = [];

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = function (event) {
                    if (event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                };
                mediaRecorder.onstop = function () {
                    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                    const audioFile = new File([audioBlob], "recorded_audio.wav");
                    const formData = new FormData();
                    formData.append("audioFile", audioFile);

                    const uploadButton = audioUploadForm.querySelector("button[type='submit']");
                    uploadButton.disabled = false;
                    audioUploadForm.dataset.recordedAudio = audioFile.name;

                    responseMessage.innerHTML = "<p>Audio recorded successfully.</p>";

                    processedAudioBlob = audioBlob;

                    // Show the playback section
                    document.getElementById("playSection").style.display = "block";
                };
                mediaRecorder.start();
            })
            .catch(function (error) {
                console.error("Error accessing microphone:", error);
            });
    }

    // Function to stop audio recording
    function stopRecording() {
        startRecordingButton.disabled = false; // Enable "Start Recording" button
        stopRecordingButton.disabled = true; // Disable "Stop Recording" button

        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
        }
    }

    // Event listeners for buttons
    startRecordingButton.addEventListener("click", startRecording); // Event listener for "Start Recording" button
    stopRecordingButton.addEventListener("click", stopRecording); // Event listener for "Stop Recording" button

    // Audio playback functionality
    if (playAudioButton) {
        playAudioButton.addEventListener("click", function () {
            if (processedAudioBlob) {
                const audioURL = URL.createObjectURL(processedAudioBlob);
                const audioPlayer = new Audio(audioURL);
                audioPlayer.controls = true;
                responseMessage.innerHTML = "<p>Playing Processed Audio:</p>";
                responseMessage.appendChild(audioPlayer);
            }
        });
    }

    // Handle audio processing and upload
    audioUploadForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(audioUploadForm);
        const recordedAudio = audioUploadForm.dataset.recordedAudio;

        if (!recordedAudio) {
            responseMessage.innerHTML = "<p>No recorded audio available.</p>";
            return;
        }

        // Use Axios to make the POST request to the server for audio processing
        axios
            .post("http://localhost:5000/process_audio", formData)
            .then((response) => {
                if (response.status === 200) {
                    return response.data;
                } else {
                    throw new Error("Upload failed");
                }
            })
            .then((data) => {
                processedAudioBlob = data;
                responseMessage.innerHTML = "<p>Audio processed successfully. You can now play it.</p>";
            })
            .catch((error) => {
                responseMessage.innerHTML = `<p>Error: ${error.message}</p>`;
            });
    });
});
