# API 라우트 정의 (엔드포인트 정의)
from fastapi import APIRouter
from chatbot_python.chatbot.models import UserRequest
from chatbot_python.chatbot.services.ai_service import generate_ai_response
from chatbot_python.chatbot.services.faq_service import get_bert_embedding

router = APIRouter()

@router.post("/ask/")
async def ask_question(user_request: UserRequest):
    user_question = user_request.question
    faq_answer = get_bert_embedding(user_question)
    ai_answer = generate_ai_response(user_question)

    return {
        "faq_answer": faq_answer,
        "generated_answer": ai_answer
    }
