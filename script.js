document.addEventListener("DOMContentLoaded", function () {
    const startRecordingButton = document.getElementById("startRecording");
    const stopRecordingButton = document.getElementById("stopRecording");
    const playInputAudioButton = document.getElementById("playInputAudio");
    const playOutputAudioButton = document.getElementById("playOutputAudio");
    const audioInputContainer = document.getElementById("audio_input");
    const audioOutputContainer = document.getElementById("audio_output");
    let mediaRecorder;
    let audioChunks = [];
    let recordedAudioBlob;

    // Function to start audio recording
    function startRecording() {
        startRecordingButton.disabled = true;
        stopRecordingButton.disabled = false;
        audioChunks = [];

        // Access the user's microphone
        try {
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
                        audioInputContainer.src = URL.createObjectURL(audioBlob);
                        recordedAudioBlob = audioBlob;
                        playInputAudioButton.disabled = false;

                        // Make an API call to send the recorded audio to the Flask server
                        sendAudioToServer(audioBlob);
                    };
                    mediaRecorder.start();
                })
                .catch(function (error) {
                    console.error("Error accessing microphone:", error);
                });
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    }

    // Function to stop audio recording
    function stopRecording() {
        startRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;

        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            try {
                mediaRecorder.stop();
            } catch (error) {
                console.error("Error stopping recording:", error);
            }
        }
    }

    // Function to play the recorded input audio
    function playInputAudio() {
        if (recordedAudioBlob) {
            const audioURL = URL.createObjectURL(recordedAudioBlob);
            audioInputContainer.src = audioURL;
            audioInputContainer.play();
        }
    }

    // Function to send recorded audio to the Flask server
    function sendAudioToServer(audioBlob) {
        const formData = new FormData();
        formData.append("audioFile", audioBlob);

        // Make an API POST request to the Flask server
        try {
            fetch("http://127.0.0.1:5000/process_audio", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.blob())
                .then((data) => {
                    // Process the response data as needed
                    // In this example, we assume the response is audio data
                    audioOutputContainer.src = URL.createObjectURL(data);
                    playOutputAudioButton.disabled = false;
                })
                .catch((error) => {
                    console.error("Error sending audio to server:", error);
                });
        } catch (error) {
            console.error("Error making API request:", error);
        }
    }

    // Event listeners for buttons
    startRecordingButton.addEventListener("click", startRecording);
    stopRecordingButton.addEventListener("click", stopRecording);
    playInputAudioButton.addEventListener("click", playInputAudio);
    playOutputAudioButton.addEventListener("click", function () {
        if (audioOutputContainer.src) {
            audioOutputContainer.play();
        }
    });
});

