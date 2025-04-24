import speech_recognition as sr
from gtts import gTTS
import os
import playsound

def speak(text: str):
    """텍스트를 음성으로 변환하여 출력"""
    print(f"🤖 봇: {text}")
    tts = gTTS(text=text, lang='ko')
    filename = "response.mp3"
    tts.save(filename)
    playsound.playsound(filename)
    os.remove(filename)

def listen() -> str:
    """마이크로부터 음성을 텍스트로 인식"""
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("🎤 사용자: 말씀하세요...")
        audio = recognizer.listen(source)

    try:
        text = recognizer.recognize_google(audio, language='ko-KR')
        print(f"👂 인식된 텍스트: {text}")
        return text
    except sr.UnknownValueError:
        print("❗ 음성을 이해하지 못했습니다.")
        return ""
    except sr.RequestError as e:
        print(f"❗ STT 오류 발생: {e}")
        return ""

def get_response(user_input: str) -> str:
    """간단한 규칙 기반 응답 생성"""
    user_input = user_input.lower()
    if "안녕" in user_input:
        return "안녕하세요. 무엇을 도와드릴까요?"
    elif "날씨" in user_input:
        return "오늘의 날씨는 맑고 따뜻합니다."
    elif "종료" in user_input:
        return "시스템을 종료합니다. 좋은 하루 되세요."
    else:
        return "죄송해요. 이해하지 못했어요."

if __name__ == "__main__":
    while True:
        user_text = listen()
        if user_text:
            response = get_response(user_text)
            speak(response)
            if "종료" in user_text:
                break
