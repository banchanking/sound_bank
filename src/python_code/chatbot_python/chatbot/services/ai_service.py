import google.generativeai as ai
from chatbot_python.chatbot.config import GOOGLE_API_KEY
import logging

# Google AI 초기화
ai.configure(api_key=GOOGLE_API_KEY)

# 에러 로깅 설정
logging.basicConfig(level=logging.INFO)

def generate_ai_response(user_question: str) -> str:
    try:
        # 응답 생성
        response = ai.GenerativeModel('gemini-1.5-flash').generate_content(user_question)
        if response.text:
            return response.text
        else:
            return "AI 응답이 비어 있습니다. 다시 시도해 주세요."
    except Exception as e:
        # 에러 발생 시 로깅 후 사용자에게 에러 메시지 반환
        logging.error(f"Google AI 호출 중 에러: {str(e)}")
        return f"Google AI 에러: {str(e)}"
