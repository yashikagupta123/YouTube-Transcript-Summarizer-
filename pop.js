document.addEventListener('DOMContentLoaded', function() {
    const btnSummarise = document.getElementById("summarise");
    const btnTranslate = document.getElementById("translate");
    const btnListen = document.getElementById("listen");
    const output = document.getElementById("output");
    const videoUrlInput = document.getElementById("videoUrl");

    btnSummarise.addEventListener("click", function() {
        console.log("Summarise button clicked");
        const url = videoUrlInput.value.trim();
        if (!url) {
            alert("Please enter a valid YouTube Video URL.");
            return;
        }
        disableButton(btnSummarise);
        fetchSummary(url);
    });

    btnTranslate.addEventListener("click", function() {
        console.log("Translate button clicked");
        const textToTranslate = output.innerText.trim();
        if (!textToTranslate) {
            alert("No text to translate. Please summarize a video first.");
            return;
        }
        disableButton(btnTranslate);
        translateText(textToTranslate);
    });

    btnListen.addEventListener("click", function() {
        console.log("Listen button clicked");
        const textToListen = output.innerText.trim();
        if (!textToListen) {
            alert("No text to listen. Please summarize a video first.");
            return;
        }
        disableButton(btnListen);
        listenToText(textToListen);
    });

    function disableButton(button) {
        button.disabled = true;
        button.innerHTML = "Processing...";
    }

    function enableButton(button, text) {
        button.disabled = false;
        button.innerHTML = text;
    }

    function fetchSummary(url) {
        fetch("http://127.0.0.1:9989/summary?url=" + encodeURIComponent(url))
            .then(response => response.text())
            .then(text => {
                output.innerHTML = text;
                enableButton(btnSummarise, "Summarise");
            })
            .catch(error => {
                alert("Error summarizing the video: " + error.message);
                enableButton(btnSummarise, "Summarise");
            });
    }

    function translateText(text) {
        fetch("http://127.0.0.1:9989/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "text=" + encodeURIComponent(text)
        })
            .then(response => response.text())
            .then(translatedText => {
                output.innerHTML = translatedText;
                enableButton(btnTranslate, "Translate");
            })
            .catch(error => {
                alert("Error translating the text: " + error.message);
                enableButton(btnTranslate, "Translate");
            });
    }

    function listenToText(text) {
        fetch("http://127.0.0.1:9989/listen", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "text=" + encodeURIComponent(text)
        })
            .then(() => {
                alert("Voice generated");
                enableButton(btnListen, "Listen");
            })
            .catch(error => {
                alert("Error generating voice: " + error.message);
                enableButton(btnListen, "Listen");
            });
    }
});
