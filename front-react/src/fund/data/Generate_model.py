import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, Dropout
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# 1. 학습 데이터 로드
data = pd.read_csv("../../../public/data/training_data.csv")  # 학습 데이터 파일 경로

# 클래스별 데이터 개수 확인
print("클래스별 데이터 분포:")
print(data["label"].value_counts())

# 2. 입력 데이터(X)와 레이블(y) 분리
X = data.drop(columns=["label"])
y = data["label"]

# 3. 학습 데이터와 테스트 데이터 분리
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. SMOTE로 데이터 증강
smote = SMOTE(random_state=42)
X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)

# SMOTE 적용 후 클래스별 데이터 개수 확인
print("SMOTE 적용 후 클래스별 데이터 분포:")
print(pd.Series(y_train_balanced).value_counts())

# 5. 클래스 가중치 계산
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(y_train_balanced),
    y=y_train_balanced
)
class_weights = dict(enumerate(class_weights))

# 6. 모델 정의
model = Sequential([
    Dense(128, activation='relu', input_shape=(X_train.shape[1],)),
    Dropout(0.3),  # 과적합 방지
    Dense(64, activation='relu'),
    Dropout(0.3),
    Dense(32, activation='relu'),
    Dense(5, activation='softmax')  # 5개의 클래스
])

print("모델이 정상적으로 생성되었습니다.")

# 7. 모델 컴파일
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# 8. 모델 학습
history = model.fit(
    X_train_balanced, y_train_balanced,
    validation_data=(X_test, y_test),
    class_weight=class_weights,
    epochs=50,
    batch_size=32
)

# 9. 학습 정확도 시각화
plt.plot(history.history['accuracy'], label='Train Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.legend()
plt.title('Accuracy')
plt.show()

# 10. 학습 손실 시각화
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.legend()
plt.title('Loss')
plt.show()

# 11. 예측값 생성 및 혼동 행렬 생성
y_pred = model.predict(X_test).argmax(axis=1)
cm = confusion_matrix(y_test, y_pred)

# 혼동 행렬 시각화
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.show()

# 12. 모델 평가
test_loss, test_accuracy = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {test_accuracy}")

# 13. 모델 저장
model.save("../../../public/data/investment_model.h5")
print("모델이 저장되었습니다.")

# 14. 모델 로드 (테스트용)
model = load_model("../../../public/data/investment_model.h5")
print("모델이 로드되었습니다.")