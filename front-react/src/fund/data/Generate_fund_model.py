import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Dropout
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt
import seaborn as sns

# ----------- 투자성향에 따른 펀드상품 추천을 위한 투자 성향 예측 모델  -----------
# AI 모델로 예측해서 fund_risk_type 자동 업데이트
def train_fund_model(input_file, model_file):
    """
    펀드 성향 예측 모델 학습 및 저장
    :param input_file: 펀드 데이터가 포함된 csv (fund_risk_type 포함)
    :param model_file: 저장할 모델 경로 (.h5)
    """
    # 학습된 모델 로드
    data = pd.read_csv(input_file)
    
    # 문자열 데이터를 숫자로 변환
    for col in ["fund_type", "fund_company"]:
        le = LabelEncoder()
        data[col] = le.fit_transform(data[col].astype(str))
        
    # 예측에 사용할 입력 피처 + 타겟 분리 (수익률 관련 컬럼)
    X = data[[
        "fund_fee_rate", "fund_upfront_fee", "fund_grade",
        "return_1m", "return_3m", "return_6m", "return_12m"
    ]].fillna(0).astype(float)
    y = LabelEncoder().fit_transform(data["fund_risk_type"])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42, test_size=0.2)
    
    # 모델 구조 정의
    model = Sequential()
    model.add(Dense(64, activation="relu", input_dim=7))
    model.add(Dropout(0.3))
    model.add(Dense(64, activation="relu"))
    model.add(Dense(5, activation="softmax"))
    
    # 컴파일 및 학습
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


# ----------- 메인 실행 -----------
if __name__ == "__main__":
    
    # 펀드 목록에 투자성향 예측 결과 추가
    train_fund_model(
        "d:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fundList.csv",
        "d:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fund_model.h5",
        "d:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fundList_updated.csv"
    )
    
# .h5 파일은 HDF5 (Hierarchical Data Format version 5) 형식의 파일로, 대용량 데이터를 저장하는 데 사용됨. Keras에서는 모델의 구조와 가중치를 저장하는 데 사용됨. 
# HDF5는 바이너리 형식으로 데이터를 저장하므로, 텍스트 파일보다 더 효율적으로 대량의 데이터를 저장하고 읽을 수 있음. 
# HDF5 파일은 다양한 프로그래밍 언어에서 지원되며, 데이터 과학 및 머신러닝 분야에서 널리 사용됨.