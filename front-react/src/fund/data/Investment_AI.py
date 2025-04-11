from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import os
from tensorflow.keras.models import load_model
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

# ----------- 모델 경로 정의 -----------
USER_MODEL_PATH = "../../../public/data/user_model.h5"
FUND_MODEL_PATH = "../../../public/data/fund_model.h5"

# ----------- 모델 불러오기 -----------
user_model = load_model(USER_MODEL_PATH)
fund_model = load_model(FUND_MODEL_PATH)
# ----------- 요청 DTO -----------
class InvestmentRequest(BaseModel):
    answers: list   # 질문에 대한 답변 리스트 (9개 질문에 대한 답변)
    
# ----------- 사용자 투자성향 예측 -----------  
# 사용자의 투자성향을 예측하는 엔드포인트  
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
    

# ----------- 펀드 성향 예측 (펀드 CSV에 적용) -----------
# 투자성향에 따른 펀드상품 예측 엔드포인트
@app.post("/predict-fund")
async def predict_fund():
    try:
        input_file = "../../../public/data/fundList.csv"
        output_file = "../../../public/data/fundList_updated.csv"

        if not os.path.exists(input_file):
            raise HTTPException(status_code=404, detail="fundList.csv not found")

        df = pd.read_csv(input_file)
        from sklearn.preprocessing import LabelEncoder

        # 문자열 라벨 인코딩
        le_type = LabelEncoder()
        le_company = LabelEncoder()
        df["fund_type"] = le_type.fit_transform(df["fund_type"].astype(str))
        df["fund_company"] = le_company.fit_transform(df["fund_company"].astype(str))

        features = [
            "fund_fee_rate", "fund_upfront_fee", "fund_grade",
            "return_1m", "return_3m", "return_6m", "return_12m"
        ]
        
        X = df[features].fillna(0).astype(float)
        predictions = fund_model.predict(X)
        predicted_classes = predictions.argmax(axis=1)
        risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]
        df["fund_risk_type"] = [risk_types[i] for i in predicted_classes]

        # 저장
        df.to_csv(output_file, index=False, encoding="utf-8-sig")
        return {"message": f"Updated file saved to {output_file}", "count": df["fund_risk_type"].value_counts().to_dict()}
    except Exception as e:
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
        return {
            "user_risk_type": user_type,
            "recommended_funds": filtered.to_dict(orient="records")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  
    
if __name__ == "__main__":
    import uvicorn  # FastAPI 애플리케이션을 실행하기 위해 uvicorn 서버를 시작하는 역할
    uvicorn.run(app, host="127.0.0.1", port=8000)    
    