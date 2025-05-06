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

# CORS 설정: React 앱 도메인만 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sound-bank.duckdns.org"],  # 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------- 모델 파일 경로 정의 -----------
# Investment_AI.py 위치: front-react/src/fund/data
# 모델 파일은 front-react/public/data 디렉터리에 있어야 합니다
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "..", "..", "public", "data"))
USER_MODEL_PATH = os.path.join(MODEL_DIR, "user_model.h5")
FUND_MODEL_PATH = os.path.join(MODEL_DIR, "fund_model.h5")

print(f"[INFO] Loading models from: {USER_MODEL_PATH} and {FUND_MODEL_PATH}")

# ----------- 모델 로드 -----------
try:
    user_model = load_model(USER_MODEL_PATH)
    fund_model = load_model(FUND_MODEL_PATH)
except OSError as e:
    print(f"[ERROR] 모델 파일을 찾을 수 없습니다: {e}")
    raise

# ----------- 요청 DTO 정의 -----------
class InvestmentRequest(BaseModel):
    answers: list  # 투자성향 테스트 응답 9개

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
        return {"predicted_class": predicted_class, "risk_type": risk_types[predicted_class]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------- 전체 펀드 투자성향 예측 및 CSV 저장 엔드포인트 -----------
@app.post("/predict-fund")  # 백엔드에서 DB 전체 불러옴
async def predict_fund():
    try:
        response = requests.get("http://localhost:8081/api/registeredFunds")
        response.raise_for_status()
        df = pd.DataFrame(response.json())
        print("등록된 펀드 수:", len(df))

        # 펀드 유형 정제 (정확한 AI 예측을 위한 표준화 작업)
        print("정제 전 fund_type 목록:", df["fund_type"].unique().tolist())
        type_map = {
            "주식형": "주식형",
            "채권형": "채권형",
            "주식혼합형": "혼합형",
            "채권혼합형": "혼합형",
            "파생상품": "파생형",
            "재간접투자": "재간접형",
            "부동산형": "기타형",
            "특별자산형": "기타형"
        }
        df["fund_type"] = df["fund_type"].map(type_map).fillna("기타형")
        print("정제 후 fund_type 목록:", df["fund_type"].unique().tolist())

        print("인코딩 전 null 체크:\n", df.isnull().sum())

        # 범주형 컬럼 라벨 인코딩
        from sklearn.preprocessing import LabelEncoder
        le_type = LabelEncoder()
        le_company = LabelEncoder()
        df["fund_type"] = le_type.fit_transform(df["fund_type"].astype(str))
        df["fund_company"] = le_company.fit_transform(df["fund_company"].astype(str))

        # 학습 피처 선택 및 전처리
        features = ["fund_fee_rate", "fund_upfront_fee", "fund_grade", "return_1m", "return_3m", "return_6m", "return_12m"]
        X = df[features].fillna(0).astype(float)
        print("예측 데이터 샘플:\n", X.head())

        # 모델 예측
        predictions = fund_model.predict(X)
        predicted_classes = predictions.argmax(axis=1)
        risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]
        df["fund_risk_type"] = [risk_types[i] for i in predicted_classes]

        # 예측 결과 저장
        os.makedirs(MODEL_DIR, exist_ok=True)
        output_path = os.path.join(MODEL_DIR, "fundList_updated.csv")
        df.to_csv(output_path, index=False, encoding="utf-8-sig")
        print("예측 완료 및 파일 저장")

        predictions = df[["fund_name", "fund_risk_type"]].to_dict(orient="records")
        return {
            "message": "펀드 투자성향 예측 완료",
            "predictions": predictions,
            "count": df["fund_risk_type"].value_counts().to_dict()
        }
    except Exception as e:
        print("[ERROR] predict_fund error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ----------- 개별 펀드 등록 시 투자성향 예측 엔드포인트 -----------
@app.post("/predict-fund-one")  # 프론트에서 DTO 단일 객체 전달
async def predict_fund_one(data: FundSingleRequest):
    try:
        features = np.array([[data.fund_fee_rate, data.fund_upfront_fee, data.fund_grade, data.return_1m, data.return_3m, data.return_6m, data.return_12m]])
        predictions = fund_model.predict(features)
        predicted_class = int(predictions.argmax(axis=1)[0])
        risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]
        return {"fund_risk_type": risk_types[predicted_class]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------- FastAPI 실행 설정 -----------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# 개발 환경 실행 (테스트): uvicorn Investment_AI:app --reload --host 0.0.0.0 --port 8000
# 운영 환경 실행 (배포): uvicorn Investment_AI:app --host 0.0.0.0 --port 8000
