# Google AI 응답처리 (API or AI ) + 응답처리할떄 쓸 API, 환경변수

import google.generativeai as ai
from chatbot_python.chatbot.config import GOOGLE_API_KEY

# Google AI 초기화
ai.configure(api_key= GOOGLE_API_KEY)

def generate_ai_response(user_question: str) -> str:
    try:
        response = ai.GenerativeModel('gemini-1.5-flash').generate_content(user_question)
        return response.text
    except Exception as e:
        return f"Google AI 에러: {str(e)}"
