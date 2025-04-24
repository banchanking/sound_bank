# 환경변수 로드 및 설정 (os , API키값 환경변수)
import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(__file__)) # chat_python 폴더
ENV_PATH = os.path.join(BASE_DIR,".env")

# 환경 변수 로드
load_dotenv(ENV_PATH)

# API 키 설정
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY is None:
    raise ValueError("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.")
