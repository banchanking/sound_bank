import logging
import re
from typing import Union, Dict, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# ===== 공통 유틸 ===== 대화관리자 or 대화 흐름 결정자

def is_similar(text: str, examples: List[str], threshold: float = 0.6) -> bool:
    corpus = [text] + examples
    vectorizer = TfidfVectorizer().fit_transform(corpus)
    sim = cosine_similarity(vectorizer[0:1], vectorizer[1:])
    max_score = max(sim[0])
    logger.info(f"유사도 최대 점수: {max_score:.2f}")
    return max_score > threshold


def match_by_pattern_or_example(text: str, patterns: List[str], examples: List[str], threshold: float = 0.6) -> bool:
    for p in patterns:
        if re.search(p, text):
            logger.info(f"정규식 일치: {p}")
            return True
    return is_similar(text, examples, threshold)

# ===== 분류 함수들 =====

def is_bankya_call(text: str) -> bool:
    patterns = [r"뱅크\s*야", r"뱅크아", r"뱅기야", r"뱅갸", r"\b뱅크\b"]
    examples = ["뱅크야", "뱅크아", "뱅기야", "뱅야", "벙크야","앵크야","엉크야","뱅","야","пınke"]
    return match_by_pattern_or_example(text, patterns, examples)

def is_loan_navigation(text: str) -> bool:
    patterns = [
        r"대출\s*페이지\s*(가[줘자]|이동|열어|보여|들어가)",
        r"(대출|loan).*(신청|이동|접속|가기)",
        r"(대출).*페이지"
    ]
    examples = ["대출 페이지 가줘", "대출 신청 페이지 열어줘", "loan 신청하러 가자", "대출 안내 페이지","가줘","대츠페이지","이동","가줘"]
    return match_by_pattern_or_example(text, patterns, examples)

def is_loan_question(text: str) -> bool:
    patterns = [
        r"대출.*(어떻게|방법|받는법|하는법|절차|되나요|되니)",
        r"대출.*(신청|진행|가능)",
        r"대출.*(받아|되|해줄)"
    ]
    examples = ["대출 어떻게 받아", "대출 신청 방법", "대출 가능해?", "대출 받을 수 있어?"]
    return match_by_pattern_or_example(text, patterns, examples)

# ===== 메인 로직 =====

def VoiceService(text: Union[str, None]) -> Dict[str, Union[str, None]]:
    try:
        if not text or not text.strip():
            logger.info("빈 텍스트 입력")
            return {"text": "잘 이해하지 못했습니다. 다시 한번 '뱅크야'라고 말씀해 주세요.", "navigateTo": None}

        text = text.strip().lower()
        logger.info(f"입력 텍스트: '{text}', 길이: {len(text)}")

        if is_bankya_call(text):
            logger.info("호출어 감지: 뱅크야")
            return {"text": "네, 무엇을 도와드릴까요?", "navigateTo": None}

        if is_loan_navigation(text):
            logger.info("페이지 이동 요청: /loanApply")
            return {"text": "대출 신청 페이지로 이동할게요.", "navigateTo": "/loanApply"}

        if is_loan_question(text):
            logger.info("대출 관련 질문 인식")
            return {
                "text": "대출은 사용자의 신용점수를 기준으로 한도와 금리가 결정됩니다.",
                "navigateTo": None
            }

        logger.info("불명확한 입력")
        return {"text": "죄송해요, 이해하지 못했어요. '뱅크야'라고 다시 말씀해 주세요.", "navigateTo": None}

    except Exception as e:
        logger.error(f"응답 처리 실패: {str(e)}", exc_info=True)
        return {"text": "시스템 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", "navigateTo": None}
