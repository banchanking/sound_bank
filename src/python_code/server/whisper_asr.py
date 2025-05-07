# whisper_stt.py
import whisper
import os
import logging

# Whisper 모델 로딩 (한 번만)
model = whisper.load_model("base",device="cpu")  # 필요 시 tiny/small/medium도 가능

def transcribe_audio(file_path: str) -> str:
    try:
        logging.info(f"STT 처리 시작: {file_path}")

        result = model.transcribe(file_path, language="ko")
        text = result.get("text", "").strip()

        logging.info(f"STT 결과 텍스트: '{text}'")
        return text if text else "음성을 인식하지 못했어요."

    except Exception as e:
        logging.error(f"STT 실패: {str(e)}", exc_info=True)
        return "음성 인식 중 오류가 발생했어요."
