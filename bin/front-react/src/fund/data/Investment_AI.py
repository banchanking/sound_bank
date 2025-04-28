from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware

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
    answers: list

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="15.165.57.30", port=8000)
    
# 펀드 추천을 위한 CSV 파일 로드
funds = pd.read_csv("D:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fundList.csv")

# 투자성향에 따른 펀드 추천 엔드포인트
@app.post("/recommend")
async def recommend(data: InvestmentRequest):
    try:
        # 투자성향 예측
        answers = np.array(data.answers).reshape(1, -1)
        prediction = model.predict(answers)
        investment_type = int(np.argmax(prediction))  # 예측된 투자성향

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