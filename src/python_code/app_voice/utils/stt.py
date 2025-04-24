import speech_recognition as sr

def transcribe_audio() -> str:
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎤 음성 인식 중...")
        audio = recognizer.listen(source)
    try:
        return recognizer.recognize_google(audio, language="ko-KR")
    except Exception:
        return ""
