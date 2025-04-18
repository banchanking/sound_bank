from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import google.generativeai as ai
import numpy as np
import pandas as pd
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity
from transformers import BertTokenizer, BertModel
import torch
from sentence_transformers import SentenceTransformer

# FastAPI 설정
chatbot = FastAPI()

# CORS 설정
chatbot.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 서버 주소 (3000번 포트) , 8000포트로 지정시 파이썬
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 환경 변수 로드
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # chat_python 폴더
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH)

# API 키 설정
api_key = os.getenv("GOOGLE_API_KEY")
if api_key is None:
    raise ValueError("GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.")

ai.configure(api_key=api_key)

# FAQ 데이터
faq_data = {
    "question": [
        "예금담보대출 금리는 어떻게 되나요?",
        "담보대출 한도는 어떻게 결정되나요?",
        "대출연체 시 어떻게 되나요?",
        "대출상환 방법은 어떻게 되나요?",
        "예금자보호 한도는 어떻게 되나요?",
        "예금과 적금의 차이는 무엇인가요?",
        "비대면 통장 개설 시 실물 통장은 어떻게 받나요?",
        "적금 중도해지 시 이자율은 어떻게 되나요?",
        "자유적립식 적금의 장점은 무엇인가요?",
        "해외송금 시 수수료는 얼마인가요?",
        "외화예금 환율 리스크는 어떻게 되나요?",
        "외국인 계좌 개설 시 필요한 서류는 무엇인가요?",
        "해외송금 한도는 어떻게 되나요?",
        "인터넷뱅킹으로 해외송금이 가능한가요?",
        "펀드 담보대출은 가능한가요?",
        "펀드 해지 시 수수료는 어떻게 되나요?",
        "연금저축펀드의 세제 혜택은 어떻게 되나요?",
        "펀드 전환 시 제한 조건은 무엇인가요?",
        "펀드 세후 이자율 계산은 어떻게 되나요?",
        "계좌번호 확인은 어디서 하나요?",
        "잔액증명서 발급은 어떻게 하나요?",
        "이체 한도 변경은 어떻게 하나요?",
        "이체 수수료는 얼마인가요?",
        "공동명의 통장에서 이체는 어떻게 하나요?",
        "거래 내역 조회 기간은 어떻게 되나요?",
        "전자금융사고 발생 시 대처 방법은 무엇인가요?",
        "비대면 실명확인 절차는 무엇인가요?",
        "통장 양도 요청을 받았습니다. 어떻게 하나요?",
        "인증 오류 발생 시 어떻게 하나요?",
        "즐처먹어라 ",
        "",
    ],
    "answer": [
        "예금에 넣은 돈의 90~100% 한도로 대출 가능하며, 대출금리는 예금금리+1.0%포인트로 저렴합니다. 신용등급 영향도 적습니다.",
        "지역, 담보인정비율, 소득, 상환능력에 따라 결정됩니다. 등기부등본, 소득증빙서류, 재직증명서 등이 필요합니다.",
        "연체 시 신용등급 하락, 연체이자 부과, 법적 조치(경매 등)가 진행될 수 있으므로 빠른 상환 또는 상담이 필요합니다.",
        "만기일시상환, 원리금균등분할상환, 원금균등분할상환 등의 방식이 있으며, 상환 방식은 대출 상품에 따라 다릅니다.",
        "원금보전형 신탁(예: 개인연금신탁)은 예금자보호법에 의해 보호됩니다. 단, 중도해지로 인한 기타소득세 등 손실은 보전 대상이 아닙니다.",
        "예금은 목돈을 일정 기간 예치하는 상품, 적금은 정기적(매월)으로 저축하는 상품입니다. 중도 해지 시 예금은 이자 손실이 클 수 있습니다.",
        "영업점을 방문해 실물 종이통장을 발급받을 수 있습니다. 이때 금융거래목적확인서 등 계좌개설 증빙자료를 제출해야 합니다.",
        "중도 해지 시 가입 시 약정한 이율보다 낮은 중도해지 이자율이 적용됩니다. 자세한 이율은 상품 가입 시 약관을 확인하거나 고객센터에 문의하세요.",
        "소득이 일정하지 않은 자영업자 등이 목돈 마련에 적합하며, 납입 금액과 시기를 자유롭게 조정 가능합니다.",
        "소액송금, 증빙서류 미제출(자본거래 포함) 송금, 유학생송금, 체재비송금, 외국인/비거주자 국내보수 송금 등이 가능하며, 송금수수료는 USD 5,000 상당액 이하 3,000원, 초과 시 5,000원입니다.",
        "외화예금은 환율 변동에 따라 원화로 환산 시 손실이 발생할 수 있습니다. 환율 리스크는 고객 부담이므로 환율 변동을 고려해 가입해야 합니다.",
        "외국인 등록증은 입국 후 90일 이내에 출입국관리사무소에서 발급받으며, 국내거소 신고증은 외국인 등록증 발급 후 거주지 관할 주민센터에서 발급받습니다. 계좌 개설 시 신분증으로 사용됩니다.",
        "송금 목적에 따라 다르며, 소액송금은 1회 USD 5,000 상당액까지 가능합니다. 대액 송금은 증빙서류 제출 후 한도가 조정됩니다.",
        "가능합니다. 소액송금, 증빙서류 미제출(자본거래 포함) 송금, 유학생송금, 체재비송금, 외국인/비거주자 국내보수 송금 등이 가능합니다.",
        "가능합니다. 단, MMF 상품은 담보대출 불가하며, 해외뮤추얼펀드 및 외화표시 국내 집합투자증권은 평가금액의 40% 이내로 제한됩니다.",
        "연금저축신탁 해지 시 기타소득세가 부과될 수 있으며, 소득공제 여부에 따라 세율이 달라집니다. 영업점에서 상담 후 처리하세요.",
        "개인연금신탁은 연간 불입액의 40% 범위 내 최고 72만원까지 소득공제, 연금저축신탁은 연간 불입액의 100% 이내 최고 400만원까지 세액공제 가능합니다.",
        "판매보수이연(CDSC) 펀드의 경우 전환기준일 또는 전환기준일 이전 1영업일에는 이동 제한이 있습니다. 자세한 조건은 상품 약관을 확인하세요.",
        "이자소득 원천징수세 15.4%(소득세 14%, 지방소득세 1.4%)를 차감한 금리입니다. 세후 실수령액은 상품 상세정보를 확인하세요.",
        "계좌개설 완료 시 계좌번호가 포함된 문자 메시지가 발송됩니다. 문자 확인이 어려운 경우 인터넷뱅킹에서 확인 가능합니다.",
        "인터넷뱅킹에서 '증명서 발급신청/조회' 메뉴를 통해 발급 가능합니다. 단, 발급기준일이 당일이거나 2년 경과 시 영업점 방문이 필요합니다.",
        "인터넷뱅킹에서 '이체한도 변경' 메뉴를 통해 변경 가능합니다. 단, 비대면 한도 초과 시 영업점 방문이 필요할 수 있습니다.",
        "이체 수수료는 거래 조건에 따라 다르며, 동일 은행 내 이체는 무료, 타행 이체는 500원~1,000원 수준입니다.",
        "공동명의 통장은 공동명의인 전원의 동의가 필요하며, 이체 시 공동명의인 전원이 기명날인한 거래확인서가 필요합니다.",
        "은행마다 다르지만, 일반적으로 10년 이상 거래 내역은 조회가 어려울 수 있습니다. 영업점에 문의하세요.",
        "즉시 고객센터로 연락해 지급정지를 신청하고, 경찰청(112)에 신고해야 합니다.",
        "만 14세 이상 가능하며, 신분증(주민등록증 또는 운전면허증)과 본인 계좌번호를 통해 본인확인을 진행합니다.",
        "통장 양도는 불법이며, 100% 사기입니다. 절대 응하지 말고, 피해 발생 시 고객센터로 지급정지 신청 후 경찰에 신고하세요.",
        "신분증 상태, 네트워크 연결을 확인 후 재시도하세요. 지속적인 오류 시 고객센터로 문의하세요.😊",
        "질문을 해주세요😊 니나 즐 처드시고요",
        "",
    ]
}

faq_df = pd.DataFrame(faq_data)

# BERT 임베딩 모델 로드
tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')   #다국어지원
model = BertModel.from_pretrained('bert-base-multilingual-cased')
bert_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2') #BERT 모델




# FAQ 질문을 BERT 임베딩으로 변환
def get_bert_embedding(text):
    tokens = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        output = model(**tokens)
    return output.last_hidden_state.mean(dim=1).squeeze().numpy()

faq_embeddings = np.array([get_bert_embedding(q) for q in faq_df["question"]])

# FastAPI 경로 설정
class UserRequest(BaseModel):
    question: str

@chatbot.get("/")
async def read_root():
    return {"message": "Welcome to the FastAPI server!"}

@chatbot.post("/ask/")
async def ask_question(user_request: UserRequest):
    user_question = user_request.question

    # 사용자의 질문을 BERT 임베딩으로 변환
    user_embedding = get_bert_embedding(user_question).reshape(1, -1)

    # 코사인 유사도 계산
    cosine_similarities = cosine_similarity(user_embedding, faq_embeddings)
    most_similar_index = cosine_similarities.argmax()

    # 가장 유사한 질문의 답변을 가져오기
    answer = faq_df.iloc[most_similar_index]['answer']

    try:
        # Google Generative AI 모델로 추가적인 답변 생성
        response = ai.GenerativeModel('gemini-1.5-flash').generate_content(user_question)
        generated_answer = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google AI 에러: {str(e)}")

    return {
        "faq_answer": answer,
        "generated_answer": generated_answer
    }
