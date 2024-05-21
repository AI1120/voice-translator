from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import speech_recognition as sr
from googletrans import Translator
from gtts import gTTS
import os

app = Flask(__name__)
CORS(app)

recognizer = sr.Recognizer()
microphone = sr.Microphone()

@app.route('/recognize-speech', methods=['POST'])
def recognize_speech():
    with microphone as source:
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    response = {
        "success": True,
        "error": None,
        "transcription": None
    }

    try:
        response["transcription"] = recognizer.recognize_google(audio, language="ar-SA")
    except sr.RequestError:
        response["success"] = False
        response["error"] = "API unavailable"
    except sr.UnknownValueError:
        response["error"] = "Unable to recognize speech"

    return jsonify(response)

@app.route('/translate-text', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text')
    src = data.get('src', 'ar')
    dest = data.get('dest', 'en')

    translator = Translator()
    translation = translator.translate(text, src=src, dest=dest)

    return jsonify({"translation": translation.text})

@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text')
    lang = data.get('lang', 'en')

    tts = gTTS(text=text, lang=lang)
    tts.save("translated_audio.mp3")

    base_dir = os.path.dirname(__file__)
    audio_file_path = os.path.join(base_dir, "translated_audio.mp3")

    return send_file(audio_file_path, mimetype='audio/mp3')

if __name__ == '__main__':
    app.run(debug=True)
