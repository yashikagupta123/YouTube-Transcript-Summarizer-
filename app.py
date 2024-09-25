from flask import Flask, request, send_file
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from transformers import pipeline, MarianMTModel, MarianTokenizer
from gtts import gTTS
import os
import re

app = Flask(__name__)
CORS(app)

# Initialize Hugging Face summarization pipeline with Facebook BART
summarizer = pipeline('summarization', model='facebook/bart-large-xsum', tokenizer='facebook/bart-large-xsum')

# Initialize Hugging Face translation pipeline for Hindi
translation_model_name = "Helsinki-NLP/opus-mt-en-hi"
translator = pipeline("translation", model=translation_model_name)

# Define route for summarization
@app.route('/summary', methods=['GET'])
def summary():
    url = request.args.get('url', '')
    
    # Validate YouTube video URL
    url_pattern = r'^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11}).*$'
    print("ddd")
    print(url)
    if not re.match(url_pattern, url):
        return "Invalid YouTube video URL", 400

    try:
        video_id = url.split('=')[1]
        # Get the transcript using YouTubeTranscriptApi
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        print(transcript_list)
        transcript = ' '.join([d['text'] for d in transcript_list])
        # Perform summarization using Hugging Face PEGASUS pipeline
        summary = summarizer(transcript, max_length=150, min_length=50, length_penalty=2.0, num_beams=4, early_stopping=True)[0]['summary_text']
        return summary, 200
    except Exception as e:
        return f"Error retrieving transcript or summarizing: {str(e)}", 500

# Define route for translation to Hindi
@app.route('/translate', methods=['POST'])
def translate():
    text = request.form['text']
    try:
        translated_text = translator(text, max_length=500)[0]['translation_text']
        return translated_text, 200
    except Exception as e:
        return f"Error translating text: {str(e)}", 500

# Define route for text-to-speech (listen)
@app.route('/listen', methods=['POST'])
def listen():
    text = request.form['text']

    # Using gTTS to generate speech
    tts = gTTS(text=text, lang='en')

    # Save the speech as an audio file
    audio_file_path = 'audio.mp3'
    tts.save(audio_file_path)

    # Play the audio file
    os.system(f"start {audio_file_path}") # This works on Windows

    # Delete the audio file to avoid cluttering the server
    os.remove(audio_file_path)

    return 'Voice generated', 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9989)
