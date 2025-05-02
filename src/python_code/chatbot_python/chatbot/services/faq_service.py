from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import logging

class FAQService:
    def __init__(self, faq_data, faq_embeddings, model_name='all-MiniLM-L6-v2'):
        self.faq_data = faq_data
        self.faq_embeddings = faq_embeddings
        self.model = SentenceTransformer(model_name)  # ✅ 모델 초기화

    def get_faq_answer(self, user_question: str, similarity_threshold: float = 0.4):
        user_embedding = self.model.encode([user_question])
        similarity_scores = cosine_similarity(user_embedding, self.faq_embeddings)
        most_similar_idx = np.argmax(similarity_scores)

        if similarity_scores[0][most_similar_idx] > similarity_threshold:
            return self.faq_data["answer"][most_similar_idx]
        else:
            return None
