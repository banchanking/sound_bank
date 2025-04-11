import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import confusion_matrix
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt
import seaborn as sns
import os


# ----------- 학습 전 라벨링 자동 생성 -----------
def auto_label_risk_type(csv_path):
    """
    펀드 속성을 기반으로 점수를 계산하여 fund_risk_type을 생성하고 저장
    """
    df = pd.read_csv(csv_path)

    def classify_risk(row):
        score = 0
        if row["fund_grade"] <= 2: score += 1
        elif row["fund_grade"] == 3: score += 2
        else: score += 3

        if row["return_12m"] >= 10: score += 3
        elif row["return_12m"] >= 5: score += 2
        else: score += 1

        if row["fund_fee_rate"] >= 1.5: score += 3
        elif row["fund_fee_rate"] >= 1.0: score += 2
        else: score += 1

        if "주식" in row["fund_type"]: score += 3
        elif "혼합" in row["fund_type"]: score += 2
        else: score += 1

        if score <= 5: return "안정형"
        elif score <= 7: return "보수형"
        elif score <= 9: return "위험중립형"
        elif score <= 11: return "적극형"
        else: return "공격형"

    df["fund_risk_type"] = df.apply(classify_risk, axis=1)
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    print("[라벨링] fund_risk_type 자동 생성 완료! 분포:")
    print(df["fund_risk_type"].value_counts())


# ----------- 투자성향에 따른 펀드상품 추천을 위한 투자 성향 예측 모델 학습 -----------
# AI 모델로 예측해서 fund_risk_type 자동 업데이트
def train_fund_model(input_file, model_file):
    """
    펀드 성향 예측 모델 학습 및 저장
    :param input_file: 펀드 데이터가 포함된 csv (fund_risk_type 포함)
    :param model_file: 저장할 모델 경로 (.h5)
    """
    # 학습된 모델 로드
    data = pd.read_csv(input_file)
    
    # 문자열 데이터를 숫자로 변환 - fund_type, fund_company 인코딩
    for col in ["fund_type", "fund_company"]:
        le = LabelEncoder()
        data[col] = le.fit_transform(data[col].astype(str))
        
    # 예측에 사용할 입력 피처 + 타겟 분리 (수익률 관련 컬럼)
    X = data[[
        "fund_fee_rate", "fund_upfront_fee", "fund_grade",
        "return_1m", "return_3m", "return_6m", "return_12m"
    ]].fillna(0).astype(float)
    
    # 성향을 숫자로 변환
    y = LabelEncoder().fit_transform(data["fund_risk_type"])
    
    # 학습/검증 분리
    X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42, test_size=0.2)
    
    # 모델 구조 정의
    model = Sequential()
    model.add(Dense(64, activation="relu", input_dim=7))
    model.add(Dropout(0.3))
    model.add(Dense(64, activation="relu"))
    model.add(Dense(5, activation="softmax")) # 5개의 성향 분류
    
    # 모델 컴파일 및 학습
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    history = model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=30, batch_size=16)

    # 정확도 시각화
    plt.plot(history.history['accuracy'], label='Train Accuracy')
    plt.plot(history.history['val_accuracy'], label='Val Accuracy')
    plt.legend()
    plt.title('Fund Model Accuracy')
    plt.show()

    # 혼동 행렬
    y_pred = model.predict(X_test).argmax(axis=1)
    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt="d", cmap="Purples")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title("Fund Model Confusion Matrix")
    plt.show()
    
    model.save(model_file, include_optimizer=False)
    print(f"[FUND MODEL] 학습 완료 및 저장: {model_file}")

    # 모델 저장
    model.save(model_file, include_optimizer=False)
    print(f"[FUND MODEL] 저장 완료: {model_file}")


# ----------- 학습된 모델로 예측하여 CSV 업데이트 -----------
def predict_fund_risk_type(model_path, input_file, output_file):
    """
    학습된 모델을 사용하여 fundList.csv에 fund_risk_type 예측 결과를 추가하고 저장
    :param model_path: .h5 모델 경로
    :param input_file: 예측할 원본 CSV (fundList.csv)
    :param output_file: 결과 저장할 CSV 경로 (fundList_updated.csv)
    """
    model = load_model(model_path, compile=False)

    df = pd.read_csv(input_file)

    # 인코딩 (모델 학습 시와 동일하게 처리해야 함)
    for col in ["fund_type", "fund_company"]:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))

    X = df[[
        "fund_fee_rate", "fund_upfront_fee", "fund_grade",
        "return_1m", "return_3m", "return_6m", "return_12m"
    ]].fillna(0).astype(float)

    predictions = model.predict(X)
    predicted_classes = predictions.argmax(axis=1)
    risk_types = ["안정형", "보수형", "위험중립형", "적극형", "공격형"]
    df["fund_risk_type"] = [risk_types[i] for i in predicted_classes]

    df.to_csv(output_file, index=False, encoding="utf-8-sig")
    print(f"[FUND PREDICT] 예측 결과 저장 완료: {output_file}")
    print("분포:", df["fund_risk_type"].value_counts().to_dict())


# ----------- 메인 실행 -----------
if __name__ == "__main__":
    
    # 라벨링 (펀드 속성 기반 투자성향 계산)
    auto_label_risk_type("../../../public/data/fundList.csv")
    
    # 모델 학습 결과 추가
    train_fund_model(
        "d:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fundList.csv",
        "d:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fund_model.h5",
    )

    # 2. 펀드 목록 기반 투자성향 예측 및 업데이트된 CSV 저장
    predict_fund_risk_type(
        "d:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fund_model.h5",
        "d:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fundList.csv",
        "d:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fundList_updated.csv"
    )    
    
# .h5 파일은 HDF5 (Hierarchical Data Format version 5) 형식의 파일로, 대용량 데이터를 저장하는 데 사용됨. Keras에서는 모델의 구조와 가중치를 저장하는 데 사용됨. 
# HDF5는 바이너리 형식으로 데이터를 저장하므로, 텍스트 파일보다 더 효율적으로 대량의 데이터를 저장하고 읽을 수 있음. 
# HDF5 파일은 다양한 프로그래밍 언어에서 지원되며, 데이터 과학 및 머신러닝 분야에서 널리 사용됨.