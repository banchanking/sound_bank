import pandas as pd
import numpy as np
import os
from imblearn.over_sampling import RandomOverSampler, SMOTE

# ----------- 투자성향 예측을 위한 샘플 데이터 전처리  -----------
# ----------- 질문과 점수 매핑 -----------
questions = [
    {"id": 1, "question": "금융투자상품에 대한 이해도는 어느 정도인가요?", "weights": [1, 3, 4, 5]}, 
    {"id": 2, "question": "고객님의 수입원은 어떻게 되시나요?", "weights": [1, 3, 5]},  
    {"id": 3, "question": "고객님의 연간 소득은 어떻게 되시나요?", "weights": [1, 2, 3, 5]},
    {"id": 4, "question": "고객님이 주로 투자한 금융상품은 어느 것인가요?", "weights": [1, 2, 3, 4, 5]},
    {"id": 5, "question": "총 자산대비 투자상품의 비중은 어떻게 되시나요?", "weights": [1, 2, 3, 4, 5]},
    {"id": 6, "question": "파생상품, 파생결합증권, 파생상품 투자펀드에 투자한 기간은 어떻게 되시나요?", "weights": [1, 3, 4, 5]},
    {"id": 7, "question": "투자금에 대한 기대수익 대비 감내 가능한 손실 수준은 어떻게 되시나요?", "weights": [1, 3, 4, 5]},
    {"id": 8, "question": "현재 금융투자상품에 가입하는 목적은 어떻게 되시나요?", "weights": [1, 3, 4, 5]},
    {"id": 9, "question": "투자하려는 자금의 투자기간은 얼마나 되시나요?", "weights": [1, 2, 3, 4, 5]},
]

# ----------- 투자성향 데이터 생성 -----------
def generate_investment_data(num_samples):
    """
    투자성향 데이터를 생성합니다.
    :param num_samples: 생성할 데이터 샘플 수
    :return: DataFrame 형태의 투자성향 데이터
    """
    data = []
    risk_type_mapping = {
        0: "안정형",
        1: "보수형",
        2: "위험중립형",
        3: "적극형",
        4: "공격형"
    }
    
    # 각 성향당 필요한 샘플 수
    per_type = num_samples # 5개
    
    type_ranges = {
        0: (10, 18),   # 안정형
        1: (19, 23),   # 보수형
        2: (24, 28),   # 위험중립형
        3: (29, 33),   # 적극형
        4: (34, 40)    # 공격형
    }
    
    np.random.seed(42)  # 재현성 보장을 위한 시드 설정
    
    while len(data) < num_samples:
        answers = [np.random.choice(len(q["weights"])) + 1 for q in questions]
        total_score = sum([questions[i]["weights"][answers[i] - 1] for i in range(len(answers))])

        for label, (low, high) in type_ranges.items():
            if low <= total_score <= high:
                count = sum(1 for d in data if d[-2] == label)
                if count < per_type:
                    data.append(answers + [label, risk_type_mapping[label]])
                break

    columns = [f"question_{i+1}" for i in range(len(questions))] + ["label", "fund_risk_type"]
    df = pd.DataFrame(data, columns=columns)
    print(df["fund_risk_type"].value_counts())
    return df        

# ----------- 투자성향에 맞는 펀드 상품추천을 위한 샘플 데이터 전처리 및 증강(SMOTE) -----------
def preprocess_data(input_file, output_file):
    """
    투자성향 데이터를 전처리하고 SMOTE를 적용하여 증강합니다.
    :param input_file: 원본 데이터 파일 경로
    :param output_file: 전처리 및 증강된 데이터 저장 경로
    """
    # 데이터 로드
    data = pd.read_csv(input_file)

    # 입력 데이터(X)와 출력 데이터(y) 분리
    X = data.drop(columns=["label", "fund_risk_type"])  # fund_risk_type 컬럼 제거
    y = data["label"]
    
    print("X 데이터 타입 확인:")
    print(X.dtypes)

    # 클래스 분포 확인
    print("Before Oversampling:")
    print(y.value_counts())
    
    # 랜덤 오버샘플링으로 최소 샘플 수 확보 - 소수 클래스의 샘플 수를 늘리기 위해 랜덤 오버샘플링을 수행
    ros = RandomOverSampler(random_state=42)
    X_resampled, y_resampled = ros.fit_resample(X, y)
    
    # 클래스 분포 확인
    print("After Random Oversampling:")
    print(pd.Series(y_resampled).value_counts())
    
    # SMOTE로 데이터 증강
    smote = SMOTE(random_state=42, k_neighbors=5)  # k_neighbors 값을 5로 설정 - 특정 클래스에 샘플이 1개 이하인 경우, SMOTE가 증강을 수행할 수 없음, k_neighbors 값을 소수 클래스의 샘플 수보다 작게 설정
    X_balanced, y_balanced = smote.fit_resample(X_resampled, y_resampled)

    # 클래스 분포 확인
    print("After SMOTE:")
    print(pd.Series(y_balanced).value_counts())
    
    # 증강된 데이터를 저장
    train_data = pd.concat([pd.DataFrame(X_balanced, columns=X.columns), pd.DataFrame(y_balanced, columns=["label"])], axis=1)
    train_data.to_csv(output_file, index=False)
    print(f"Preprocessed data saved to {output_file}")

# ----------- 실행 코드 -----------
if __name__ == "__main__":
    # 데이터 생성
    num_samples = 10000 # 샘플 수
    df = generate_investment_data(num_samples)

    # 생성된 데이터를 CSV 파일로 저장
    input_file = "../../../public/data/training_data.csv"
    df.to_csv(input_file, index=False)
    print(f"Training data saved to {input_file}")

    # 데이터 전처리 및 증강
    output_file = "../../../public/data/preprocessed_data.csv"
    preprocess_data(input_file, output_file)
    
    data = pd.read_csv(input_file)
    
    # label 값의 고유 값 확인
    print("Label 값의 고유 값:", data["label"].unique())
    
    # 정리된 데이터 저장
    data.to_csv(output_file, index=False)
    print(f"정리된 데이터가 저장되었습니다: {output_file}")

    
    