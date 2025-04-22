# credit_rank_predict_api.py
import joblib
import pandas as pd
from flask import Flask, request, jsonify

app = Flask(__name__)

# 저장된 모델 불러오기
model = joblib.load("credit_rank_model.pkl")

@app.route('/predict-credit-rank', methods=['POST'])
def predict_credit_rank():
    data = request.json

    # 예시 input: JSON 형식
    # {
    #     "late_count_3m": 2,
    #     "loan_total_amount": 30000000,
    #     "loan_balance_total": 20000000,
    #     "asset_total": 50000000,
    #     "debt_to_asset_ratio": 0.4,
    #     "completed_term_ratio": 0.6
    # }

    input_df = pd.DataFrame([data])

    # 예측 수행
    prediction = model.predict(input_df)[0]

    return jsonify({
        "predicted_credit_rank": int(prediction)
    })

if __name__ == '__main__':
    app.run(debug=True)
