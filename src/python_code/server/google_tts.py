# tts_service.py

import os
from pathlib import Path
from google.cloud import texttospeech
from dotenv import load_dotenv
import logging

# ========== 1. 환경변수 로드 및 인증 세팅 ==========
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

google_credentials = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if not google_credentials:
    raise EnvironmentError("GOOGLE_APPLICATION_CREDENTIALS 환경변수가 설정되지 않았습니다.")

# 절대 경로로 변환해서 환경변수 재설정
credentials_path = Path(__file__).parent / google_credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(credentials_path.resolve())

# ========== 2. TTS 클라이언트 생성 ==========
def create_tts_client() -> texttospeech.TextToSpeechClient:
    return texttospeech.TextToSpeechClient()

# ========== 3. 텍스트 → MP3 변환 ==========
def synthesize_speech(text: str, output_path: str):
    try:
        client = create_tts_client()

        synthesis_input = texttospeech.SynthesisInput(text=text)

        voice = texttospeech.VoiceSelectionParams(
            language_code="ko-KR",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        with open(output_path, "wb") as out:
            out.write(response.audio_content)

        logging.info(f"TTS 변환 완료: {output_path}")

    except Exception as e:
        logging.error(f"TTS 처리 실패: {str(e)}", exc_info=True)
        raise
