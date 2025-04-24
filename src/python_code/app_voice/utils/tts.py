from gtts import gTTS
import os

def generate_tts(text: str, filename: str = "static/response.mp3"):
    tts = gTTS(text=text, lang='ko')
    tts.save(filename)
    return filename
