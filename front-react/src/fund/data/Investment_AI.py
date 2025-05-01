from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import os
from tensorflow.keras.models import load_model
import requests
import subprocess   # subprocess 모듈을 사용하여 외부 명령어 실행

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

# 디버그용 경로 출력
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

# ----------- 전체 펀드 투자성향 예측 엔드포인트 -----------
@app.post("/predict-fund")
async def predict_fund():
    try:
        response = requests.get("http://15.165.57.30:8081/api/registeredFunds")
        response.raise_for_status()
        df = pd.DataFrame(response.json())

        # 2) 범주형 컬럼 라벨 인코딩
        from sklearn.preprocessing import LabelEncoder
        le_type = LabelEncoder()
        le_company = LabelEncoder()
        df["fund_type"] = le_type.fit_transform(df["fund_type"].astype(str))
        df["fund_company"] = le_company.fit_transform(df["fund_company"].astype(str))

        # 3) 예측에 사용할 피처 선택 및 전처리
        features = ["fund_fee_rate", "fund_upfront_fee", "fund_grade", "return_1m", "return_3m", "return_6m", "return_12m"]
        X = df[features].fillna(0).astype(float)

        # 4) 모델 예측 수행
        predictions = fund_model.predict(X)
        predicted_classes = predictions.argmax(axis=1)
        risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]
        df["fund_risk_type"] = [risk_types[i] for i in predicted_classes]

        # 5) 예측 결과를 CSV 파일로 저장
        os.makedirs(MODEL_DIR, exist_ok=True)
        output_path = os.path.join(MODEL_DIR, "fundList_updated.csv")
        df.to_csv(output_path, index=False, encoding="utf-8-sig")

        # 6) 처리 결과 요약 반환 (예측된 펀드별 이름·위험도 리스트를 함께 내려줌)
        predictions = df[["fund_name", "fund_risk_type"]] \
            .to_dict(orient="records")
        return {
            "message": "펀드 투자성향 예측 완료",
            "predictions": predictions,
            "count": df["fund_risk_type"].value_counts().to_dict()
        }
    except Exception as e:
        print("[ERROR] predict_fund error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ----------- 단일 펀드 투자성향 예측 엔드포인트 -----------
@app.post("/predict-fund-one")
async def predict_fund_one(data: FundSingleRequest):
    try:
        features = np.array([[data.fund_fee_rate, data.fund_upfront_fee, data.fund_grade, data.return_1m, data.return_3m, data.return_6m, data.return_12m]])
        predictions = fund_model.predict(features)
        predicted_class = int(predictions.argmax(axis=1)[0])
        risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]
        return {"fund_risk_type": risk_types[predicted_class]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------- AI 모델 재학습 엔드포인트 -----------
@app.post("/retrain")
async def retrain():
    try:
        # 1) 재학습 스크립트를 동기 실행
        #    예: Generate_fund_model.py 안에 모델 저장 로직이 들어 있다고 가정
        result = subprocess.run(
            ["python", os.path.join(BASE_DIR, "..", "..", "Generate_fund_model.py")],
            capture_output=True,
            text=True,
            check=True
        )
        # 2) 로그를 찍어서 터미널에서 확인할 수 있도록
        print("[retrain stdout]\n", result.stdout)
        print("[retrain stderr]\n", result.stderr)
        # 3) 완료 메시지를 호출한 클라이언트에 반환
        return {"message": "AI 모델 재학습 완료"}
    except subprocess.CalledProcessError as e:
        print("[ERROR] retrain failed:", e.stderr)
        raise HTTPException(status_code=500, detail="재학습 중 오류 발생")

        # 펀드 목록 가져오기
        response = requests.get("http://15.165.57.30:8081/api/registeredFunds")
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
    uvicorn.run(app, host="0.0.0.0", port=8000) # FastAPI 서버 실행

# ------------- FastAPI 서버 실행 방법 -----------
# 개발 환경 (테스트) uvicorn Investment_AI:app --reload --host 0.0.0.0 --port 8000
# 운영 환경 (배포) uvicorn Investment_AI:app --host 0.0.0.0 --port 8000