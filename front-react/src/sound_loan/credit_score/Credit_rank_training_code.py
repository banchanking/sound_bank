import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns

# 1. 데이터 불러오기
df = pd.read_csv("/mnt/data/dummy_credit_score_regression_5000.csv")

# 2. X, y 분리
X = df.drop(columns=["customer_id", "credit_score"])
y = df["credit_score"]

# 3. 학습/테스트 분리
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. 선형 회귀 모델 학습
model = LinearRegression()
model.fit(X_train, y_train)

# 5. 예측
y_pred = model.predict(X_test)

# 6. 평가 지표
mae = mean_absolute_error(y_test, y_pred)
rmse = mean_squared_error(y_test, y_pred, squared=False)
r2 = r2_score(y_test, y_pred)

# 7. 예측 vs 실제 시각화
plt.figure(figsize=(6, 4))
sns.scatterplot(x=y_test, y=y_pred, alpha=0.5)
plt.plot([400, 1000], [400, 1000], color='red', linestyle='--', label='Ideal Fit')
plt.title("Actual vs Predicted Credit Scores")
plt.xlabel("Actual Credit Score")
plt.ylabel("Predicted Credit Score")
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()

(mae, rmse, r2)
