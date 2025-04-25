# src/customer_center/app/chatbot/ask.py

import sys
import json

# 질문 받기
question = sys.argv[1] if len(sys.argv) > 1 else "질문 없음"

# 간단한 응답 생성 (예시)
faq_answer = "이건 FAQ 자동응답입니다."
generated_answer = f"'{question}'에 대해 생성된 답변입니다."

# JSON으로 출력 (반드시 print)
print(json.dumps([faq_answer, generated_answer]))
