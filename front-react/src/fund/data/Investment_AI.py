from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import os
from tensorflow.keras.models import load_model
import requests

# ----------- FastAPI 서버 기본 설정 -----------
app = FastAPI()

# CORS 설정 (모든 출처 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------- 모델 경로 정의 -----------
USER_MODEL_PATH = "../../../public/data/user_model.h5"
FUND_MODEL_PATH = "../../../public/data/fund_model.h5"

# ----------- 모델 불러오기 -----------
user_model = load_model(USER_MODEL_PATH)
fund_model = load_model(FUND_MODEL_PATH)

# ----------- 사용자 투자성향 예측용 DTO -----------
class InvestmentRequest(BaseModel):
    answers: list  # 9개 질문에 대한 답변 리스트

# ----------- 펀드 단일 예측용 DTO (✨추가된 부분) -----------
class FundSingleRequest(BaseModel):
    fund_fee_rate: float
    fund_upfront_fee: float
    fund_grade: int
    return_1m: float
    return_3m: float
    return_6m: float
    return_12m: float

# ----------- 사용자 투자성향 예측 엔드포인트 -----------
@app.post("/predict-user")
async def predict_user(data: InvestmentRequest):
    try:
        if len(data.answers) != 9:
            raise HTTPException(status_code=400, detail="Input must have 9 features.")
        
        X = np.array(data.answers).reshape(1, -1)
        prediction = user_model.predict(X)
        predicted_class = int(np.argmax(prediction))
        risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]

        return {
            "predicted_class": predicted_class,
            "risk_type": risk_types[predicted_class]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------- 전체 펀드 성향 예측 엔드포인트 -----------
@app.post("/predict-fund")
async def predict_fund():
    try:
        response = requests.get("http://localhost:8081/api/registeredFunds")
        response.raise_for_status()
        df = pd.DataFrame(response.json())

        # 라벨 인코딩
        from sklearn.preprocessing import LabelEncoder
        le_type = LabelEncoder()
        le_company = LabelEncoder()
        df["fund_type"] = le_type.fit_transform(df["fund_type"].astype(str))
        df["fund_company"] = le_company.fit_transform(df["fund_company"].astype(str))

        # 입력 피처
        features = [
            "fund_fee_rate", "fund_upfront_fee", "fund_grade",
            "return_1m", "return_3m", "return_6m", "return_12m"
        ]
        X = df[features].fillna(0).astype(float)

        # 예측
        predictions = fund_model.predict(X)
        predicted_classes = predictions.argmax(axis=1)
        risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]
        df["fund_risk_type"] = [risk_types[i] for i in predicted_classes]

        # 파일로 저장
        df.to_csv("../../../public/data/fundList_updated.csv", index=False, encoding="utf-8-sig")

        return {
            "message": "펀드 투자성향 예측 완료",
            "count": df["fund_risk_type"].value_counts().to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------- 단일 펀드 투자성향 예측 엔드포인트 -----------
@app.post("/predict-fund-one")
async def predict_fund_one(data: FundSingleRequest):
    try:
        # 입력값 구성
        features = np.array([[
            data.fund_fee_rate,
            data.fund_upfront_fee,
            data.fund_grade,
            data.return_1m,
            data.return_3m,
            data.return_6m,
            data.return_12m
        ]])

        # 예측
        predictions = fund_model.predict(features)
        predicted_class = predictions.argmax(axis=1)[0]
        risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]

        return {
            "fund_risk_type": risk_types[predicted_class]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------- 투자성향에 따른 펀드 추천 엔드포인트 -----------
@app.post("/recommend")
async def recommend_fund(data: InvestmentRequest):
    try:
        X = np.array(data.answers).reshape(1, -1)
        prediction = user_model.predict(X)
        predicted_class = int(np.argmax(prediction))
        risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]
        user_type = risk_types[predicted_class]

        # 펀드 목록 가져오기
        response = requests.get("http://localhost:8081/api/registeredFunds")
        funds = pd.DataFrame(response.json())

        # 필터링
        filtered = funds[funds["fund_risk_type"] == user_type]
        if filtered.empty:
            return {
                "user_risk_type": user_type,
                "recommended_funds": [],
                "message": "No funds available for the user's risk type."
            }

        return {
            "user_risk_type": user_type,
            "recommended_funds": filtered.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------- FastAPI 실행 -----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
