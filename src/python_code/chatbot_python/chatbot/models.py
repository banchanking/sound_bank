# 데이터 모델 정의 (pydantic , BERT 모델 등)
from pydantic import BaseModel                      #모델

# FastAPI 경로 설정 데이터 모델 정의
class UserRequest(BaseModel):
    question: str