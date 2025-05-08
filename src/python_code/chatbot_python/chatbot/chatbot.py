from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as ai
import numpy as np

# FastAPI 인스턴스
chatbot = FastAPI()

# CORS 설정 추가
origins = [
    "https://sound-bank.duckdns.org:3000",  # React 클라이언트가 실행되는 주소
]

chatbot.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # React 클라이언트에서 요청을 허용할 도메인 목록
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용 (GET, POST, PUT, DELETE 등)
    allow_headers=["*"],  # 모든 헤더 허용
)

# 예시 FAQ 데이터
faq = {
  "예금담보대출 금리는 어떻게 되나요?": "예금에 넣은 돈의 90~100% 한도로 대출 가능하며, 대출금리는 예금금리+1.0%포인트로 저렴합니다.",
  "담보대출 한도는 어떻게 결정되나요?": "지역, 담보인정비율, 소득, 상환능력에 따라 결정됩니다.",
  "대출연체 시 어떻게 되나요?": "연체 시 신용등급 하락, 연체이자 부과, 법적 조치가 있을 수 있습니다.",
  "대출상환 방법은 어떻게 되나요?": "만기일시상환, 원리금균등분할상환 등 다양한 상환 방식이 있습니다.",
  "예금자보호 한도는 어떻게 되나요?": "예금자보호법에 의해 1인당 최대 5천만 원까지 보호됩니다.",
  "예금과 적금의 차이는 무엇인가요?": "예금은 일시 예치, 적금은 정기적 저축입니다.",
  "비대면 통장 개설 시 실물 통장은 어떻게 받나요?": "영업점 방문하여 실물통장을 발급받을 수 있습니다.",
  "적금 중도해지 시 이자율은 어떻게 되나요?": "중도 해지 시 약정이율보다 낮은 중도해지이율이 적용됩니다.",
  "자유적립식 적금의 장점은 무엇인가요?": "자유롭게 금액을 선택해 저축할 수 있는 것이 장점입니다.",
  "해외송금 시 수수료는 얼마인가요?": "USD 5,000 이하 3,000원, 초과 시 5,000원입니다.",
  "외화예금 환율 리스크는 어떻게 되나요?": "환율 변동으로 인한 손실은 고객 책임입니다.",
  "외국인 계좌 개설 시 필요한 서류는 무엇인가요?": "외국인 등록증, 국내거소신고증 등이 필요합니다.",
  "해외송금 한도는 어떻게 되나요?": "소액송금은 USD 5,000까지, 초과 시 서류 제출 필요.",
  "인터넷뱅킹으로 해외송금이 가능한가요?": "인터넷뱅킹을 통한 해외송금도 가능합니다.",
  "펀드 담보대출은 가능한가요?": "가능합니다. 단, 일부 펀드는 제외됩니다.",
  "펀드 해지 시 수수료는 어떻게 되나요?": "연금저축신탁 해지 시 기타소득세가 부과될 수 있습니다.",
  "연금저축펀드의 세제 혜택은 어떻게 되나요?": "불입액에 따라 소득공제 또는 세액공제가 가능합니다.",
  "펀드 전환 시 제한 조건은 무엇인가요?": "특정 시점 전후에는 펀드 전환이 제한될 수 있습니다.",
  "펀드 세후 이자율 계산은 어떻게 되나요?": "이자소득세 차감 후 수령 금액은 다를 수 있습니다.",
  "계좌번호 확인은 어디서 하나요?": "계좌개설 시 문자로 안내되며, 인터넷뱅킹에서도 확인 가능합니다.",
  "잔액증명서 발급은 어떻게 하나요?": "인터넷뱅킹에서 증명서 발급이 가능합니다.",
  "이체 한도 변경은 어떻게 하나요?": "인터넷뱅킹에서 한도 변경 가능, 초과 시 방문 필요.",
  "이체 수수료는 얼마인가요?": "동일은행 무료, 타행 500~1,000원 수준입니다.",
  "공동명의 통장에서 이체는 어떻게 하나요?": "공동명의자의 동의 및 확인서가 필요합니다.",
  "거래 내역 조회 기간은 어떻게 되나요?": "일반적으로 10년 이내의 거래내역이 조회됩니다.",
  "전자금융사고 발생 시 대처 방법은 무엇인가요?": "즉시 신고 후 자금동결 등의 조치를 취해야 합니다.",
  "비대면 실명확인 절차는 무엇인가요?": "주민등록번호 및 신용정보가 일치해야 인증됩니다.",
  "통장 양도 요청을 받았습니다. 어떻게 하나요?": "통장 양도는 불법이며 처벌 대상입니다.",
  "인증 오류 발생 시 어떻게 하나요?": "고객센터 문의 또는 인증서 재발급 필요합니다.",
  "안녕 하세요.": "안녕하세요! 무엇을 도와드릴까요?"
};


# 질문-답변 리스트 생성
faq_questions = list(faq.keys())
faq_answers = list(faq.values())

# TF-IDF 벡터화
vectorizer = TfidfVectorizer()

@chatbot.post("/ask")
async def ask_question(request: Request):
    data = await request.json()
    question = data.get("question", "")

    # 질문을 벡터화하여 유사도 계산
    questions_with_input = faq_questions + [question]
    tfidf_matrix = vectorizer.fit_transform(questions_with_input)

    # 입력 질문과 FAQ 질문 간의 코사인 유사도 계산
    cosine_sim = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])

    # 가장 유사한 질문 찾기
    most_similar_index = np.argmax(cosine_sim)
    most_similar_question = faq_questions[most_similar_index]

    # 유사한 질문에 대한 답변 가져오기
    answer = faq.get(most_similar_question, "죄송합니다. 그에 대한 답변은 아직 준비되지 않았습니다.")

    return {"answer": answer}
