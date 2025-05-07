# main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dialogue_manager import VoiceService
from whisper_asr import transcribe_audio  # STT 로직
from google_tts import synthesize_speech  # TTS 로직
from fastapi.staticfiles import StaticFiles
import os
import shutil
import uuid
import logging

# 로그 설정
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

app = FastAPI()

# CORS 설정 (프론트 연결 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
# 오디오 저장 폴더
STATIC_DIR = "static"
os.makedirs(STATIC_DIR, exist_ok=True)

@app.post("/voice")
async def voice_endpoint(file: UploadFile = File(...)):
    try:
        # 1. 저장할 경로 생성
        temp_path = os.path.join(STATIC_DIR, f"{uuid.uuid4()}.webm")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logging.info(f"오디오 파일 저장 완료: {temp_path}")

        # 2. STT 변환 (Whisper)
        text = transcribe_audio(temp_path)
        logging.info(f"STT 결과: {text}")

        # 3. 대화 흐름 분석
        result = VoiceService(text)
        logging.info(f"분석 결과: {result}")

        # 4. 응답 텍스트 TTS로 변환
        mp3_filename = f"{uuid.uuid4()}.mp3"
        mp3_path = os.path.join(STATIC_DIR, mp3_filename)
        synthesize_speech(result["text"], mp3_path)
        logging.info(f"TTS 오디오 생성 완료: {mp3_path}")

        return JSONResponse({
            "text": result.get("text"),
            "audioUrl": f"http://localhost:8002/static/{mp3_filename}",
            "navigateTo": result.get("navigateTo") or None
        })

    except Exception as e:
        logging.error(f"오류 발생: {str(e)}", exc_info=True)
        return JSONResponse({"text": "서버 오류가 발생했습니다.", "audioUrl": None}, status_code=500)
