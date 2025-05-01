import numpy as np
import pandas as pd
import torch
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity
from chatbot_python.chatbot.faq import faq_data

# FAQ 데이터를 변환
faq_df = pd.DataFrame(faq_data)

# BERT 임베딩 모델 로드
tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')  # 다국어 지원
model = BertModel.from_pretrained('bert-base-multilingual-cased')


# BERT 임베딩 모델을 통해 질문을 벡터로 변환
def get_bert_embedding(text):
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        output = model(**tokens)
    # 임베딩은 [CLS] 토큰의 벡터를 사용
    return output.last_hidden_state[:, 0, :].squeeze().numpy()


# FAQ 질문들을 BERT 임베딩으로 변환하여 저장
faq_embeddings = np.array([get_bert_embedding(q) for q in faq_df["question"]])


# 사용자의 질문에 가장 유사한 FAQ 답변을 찾는 함수
def get_most_similar_faq_answer(query):
    query_embedding = get_bert_embedding(query)

    # Cosine similarity 계산
    cos_sim = cosine_similarity([query_embedding], faq_embeddings)

    # 가장 유사한 질문 인덱스 찾기
    most_similar_idx = np.argmax(cos_sim)

    # 해당 질문의 답변 반환
    return faq_df.iloc[most_similar_idx]['answer']


# 테스트
user_query = "계좌를 개설하려면 어떻게 해야 하나요?"
answer = get_most_similar_faq_answer(user_query)
print(answer)
