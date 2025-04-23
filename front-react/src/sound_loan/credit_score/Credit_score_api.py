from flask import Flask, request, jsonify
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
import os
from flask_cors import CORS

MODEL_PATH = "credit_score_model_final.pkl"
CSV_PATH = "dummy_credit_score_final_realistic.csv"

# === 모델 학습 ===
if not os.path.exists(MODEL_PATH):
    df = pd.read_csv(CSV_PATH)
    X = df.drop(columns=["customer_id", "credit_score"])

    # 파생 변수 계산
    X["late_penalty"] = X["late_count_3m"] ** 2.2
    X["loan_ratio"] = X["loan_balance_total"] / (X["asset_total"] + 1)
    X["loan_ratio_penalty"] = (X["loan_ratio"] * 100) ** 1.2

    X["asset_bonus"] = ((X["loan_balance_total"] == 0) & (X["loan_total_amount"] == 0)).astype(int) * (
        X["asset_total"] / 1_000_000).clip(0, 200)

    X["repayment_bonus"] = X["completed_term_ratio"].clip(0.8, 1.0) * 100

    features = X[["late_penalty", "loan_ratio_penalty", "asset_bonus", "repayment_bonus"]]
    y = df["credit_score"]

    model = LinearRegression()
    model.fit(features, y)
    joblib.dump(model, MODEL_PATH)
else:
    model = joblib.load(MODEL_PATH)

# === Flask API ===
app = Flask(__name__)
CORS(app)

@app.route("/predict-credit-score", methods=["POST"])
def predict_credit_score():
    print("✅ 요청 도착! 데이터:", request.json)
    data = request.json
    try:
        df = pd.DataFrame([data])

        # 파생 변수 계산
        df["late_penalty"] = df["late_count_3m"] ** 2.2
        df["loan_ratio"] = df["loan_balance_total"] / (df["asset_total"] + 1)
        df["loan_ratio_penalty"] = (df["loan_ratio"] * 100) ** 1.2

        df["asset_bonus"] = ((df["loan_balance_total"] == 0) & (df["loan_total_amount"] == 0)).astype(int) * (
            df["asset_total"] / 1_000_000).clip(0, 200)

        df["repayment_bonus"] = df["completed_term_ratio"].clip(0.8, 1.0) * 100

        features = df[["late_penalty", "loan_ratio_penalty", "asset_bonus", "repayment_bonus"]]
        score = model.predict(features)[0]
        final_score = max(300, min(score, 990))

        # 로그 출력
        print("📌 신용점수 계산 로그:")
        print(f"- base_score: {score:.2f}")
        print(f"- late_penalty: {df['late_penalty'].values[0]:.2f}")
        print(f"- loan_ratio_penalty: {df['loan_ratio_penalty'].values[0]:.2f}")
        print(f"- asset_bonus: {df['asset_bonus'].values[0]:.2f}")
        print(f"- repayment_bonus: {df['repayment_bonus'].values[0]:.2f}")
        print(f"✅ 최종 신용점수: {final_score:.2f}")

        return jsonify({"predicted_credit_score": round(final_score, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# === 서버 실행 ===
if __name__ == "__main__":
    app.run(debug=True)
