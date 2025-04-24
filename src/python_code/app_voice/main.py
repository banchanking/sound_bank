from fastapi import FastAPI, WebSocket, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from utils.stt import transcribe_audio
from utils.tts import generate_tts
from utils.emotion import analyze_emotion

app = FastAPI()

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# static 파일을 제공하기 위한 설정
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.post("/upload-audio")
async def upload_audio(file: UploadFile = File(...)):
    # 업로드된 오디오 파일을 저장
    file_location = f"static/{file.filename}"
    with open(file_location, "wb") as f:
        f.write(await file.read())

    # transcribe_audio 함수 호출 (파일 경로를 인자로 넘김)
    text = transcribe_audio(file_location)  # 경로를 인자로 넘깁니다.
    if text:
        emotion = analyze_emotion(text)
        response_text = f"당신의 말은 '{text}'이고 감정은 '{emotion}'입니다."
        mp3_path = generate_tts(response_text)
        return {"message": f"File saved at {file_location}", "audio_path": f"/static/{mp3_path}"}
    else:
        return {"message": "음성 인식 실패"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        await websocket.send_text(" 말을 시작하세요 (서버는 대기 중입니다)...")
        text = await transcribe_audio_from_ws(websocket)  # WebSocket을 통한 음성 전송 후 텍스트 얻기
        if text == "":
            await websocket.send_text(" 음성을 인식하지 못했습니다.")
            continue
        emotion = analyze_emotion(text)
        await websocket.send_text(f" 인식된 텍스트: {text}")
        await websocket.send_text(f" 감정 분석: {emotion}")

        response_text = f"당신의 말은 '{text}'이고 감정은 '{emotion}'입니다."
        mp3_path = generate_tts(response_text)
        await websocket.send_text(f"[TTS 완료] 음성 파일: /static/{mp3_path}")


async def transcribe_audio_from_ws(websocket: WebSocket):
    # WebSocket을 통해 받은 음성 데이터를 처리하는 함수
    # 이 부분은 필요에 따라 음성을 파일로 저장하거나 직접 처리하는 코드로 바꾸세요.
    return "샘플 텍스트"  # 음성을 텍스트로 변환하여 반환
