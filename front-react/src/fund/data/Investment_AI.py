from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
import os
from Generate_model import train_model  
import tensorflow as tf
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware
import requests  # API 호출을 위한 라이브러리

# ----------- 투자성향 예측을 위한 샘플 데이터 전처리 및 모델 학습 -----------
app = FastAPI()

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인 허용
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 투자성향 분석을 위한 모델 로드 (모델을 직접 학습 후 저장해야 함)
model = load_model("../../../public/data/investment_model.h5")

# 요청 데이터 모델 정의
class InvestmentRequest(BaseModel):
    answers: list # 사용자가 입력한 투자 성향 질문에 대한 답변 리스트

# 관리자가 직접 학습한 모델을 재학습시키는 엔드포인트
@app.post("/retrain")
async def retrain_model():
    try:
        input_file = "../../../public/data/training_data.csv"
        model_file = "../../../public/data/investment_model.h5"
        
        if not os.path.exists(input_file):
            return {"message": "training_data.csv 파일이 존재하지 않습니다."}

        train_model(input_file, model_file)
        return {"message": "모델이 성공적으로 재학습되었습니다."}
    except Exception as e:
        return {"message": f"모델 재학습 중 오류 발생: {str(e)}"}
    
# 투자성향을 예측하는 엔드포인트
@app.post("/predict")
async def predict(data: InvestmentRequest):
    try:
        # 요청 데이터 출력
        print(f"Received data: {data.answers}")  # 디버깅용 로그
        
        # 입력 데이터가 9개의 특성을 가지는지 확인
        if len(data.answers) != 9:
            raise HTTPException(status_code=400, detail="Input data must have exactly 9 features.")

        # 입력 데이터를 NumPy 배열로 변환하고 올바른 형상으로 변환
        answers = np.array(data.answers).reshape(1, -1)
        prediction = model.predict(answers)
        investment_type = int(np.argmax(prediction))  # 예측 결과에서 가장 높은 확률을 가진 클래스 선택
        return {"investment_type": investment_type}
    except Exception as e:
        print(f"Error during prediction: {e}")  # 예외 출력
        raise HTTPException(status_code=500, detail=str(e))

# ----------- 학습된 투자성향 예측 모델로 펀드목록 추천 -----------
# 관리자가 등록한 펀드 데이터를 가져오는 함수
def fetch_registered_funds():
    try:
        # API 호출을 통해 관리자가 등록한 펀드 데이터를 가져옴
        response = requests.get("http://localhost:8081/api/registeredFunds")
        response.raise_for_status()  # HTTP 오류 발생 시 예외 발생
        funds = pd.DataFrame(response.json())  # JSON 데이터를 Pandas DataFrame으로 변환
        return funds
    except Exception as e:
        print(f"Error fetching registered funds: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch registered funds.")
    
# 투자성향에 따른 펀드 추천 엔드포인트
@app.post("/recommend")
async def recommend(data: InvestmentRequest):
    try:
        # 투자성향 예측
        answers = np.array(data.answers).reshape(1, -1)
        prediction = model.predict(answers)
        investment_type = int(np.argmax(prediction))  # 예측된 투자성향

        # 관리자가 등록한 펀드 데이터 가져오기
        funds = fetch_registered_funds()
        
        # 투자성향에 따른 펀드 필터링
        if investment_type == 0:  # 안정형
            recommended_funds = funds[funds["펀드등급"] <= 2]
        elif investment_type == 1:  # 보수형
            recommended_funds = funds[(funds["펀드등급"] > 2) & (funds["펀드등급"] <= 3)]
        elif investment_type == 2:  # 위험중립형
            recommended_funds = funds[funds["펀드등급"] == 3]
        elif investment_type == 3:  # 적극형
            recommended_funds = funds[(funds["펀드등급"] > 3) & (funds["펀드등급"] <= 4)]
        elif investment_type == 4:  # 공격형
            recommended_funds = funds[funds["펀드등급"] >= 4]
        else:
            recommended_funds = pd.DataFrame()  # 빈 데이터프레임

        # 추천 펀드 목록 반환
        return {
            "investment_type": investment_type,
            "recommended_funds": recommended_funds[["상품명", "펀드등급", "펀드유형"]].to_dict(orient="records")
        }
    except Exception as e:
        print(f"Error during recommendation: {e}")
        raise HTTPException(status_code=500, detail=str(e))   
    
if __name__ == "__main__":
    import uvicorn  # FastAPI 애플리케이션을 실행하기 위해 uvicorn 서버를 시작하는 역할
    uvicorn.run(app, host="127.0.0.1", port=8000)    
    