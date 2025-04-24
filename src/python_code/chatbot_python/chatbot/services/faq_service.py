# BERT 기반 FAQ 검색 ( FAQ.py 에 있는 데이터 가공)

import numpy as np
import pandas as pd
import torch                                        #pythonTorch
from transformers import BertTokenizer, BertModel

from chatbot_python.chatbot.faq import faq_data

# FAQ 데이터를 변환
faq_df = pd.DataFrame(faq_data)

# BERT 임베딩 모델 로드
tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')   #다국어지원
model = BertModel.from_pretrained('bert-base-multilingual-cased')

# BERT 임베딩 모델 로드
tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')   #다국어지원
model = BertModel.from_pretrained('bert-base-multilingual-cased')

# FAQ 질문을 BERT 임베딩으로 변환
def get_bert_embedding(text):
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        output = model(**tokens)
    return output.last_hidden_state.mean(dim=1).squeeze().numpy()

faq_embeddings = np.array([get_bert_embedding(q) for q in faq_df["question"]])