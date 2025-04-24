from transformers import pipeline

# 한국어 감정 분석 모델 (huggingface hub에서 무료)
classifier = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

def analyze_emotion(text: str) -> str:
    result = classifier(text)[0]
    label = result['label']
    return f"감정 분석 결과: {label}"
