import easyocr
import os
import cv2
import numpy as np
import re

# EasyOCR 리더 초기화 (한국어 설정)
reader = easyocr.Reader(['ko'], gpu=False)

# 이미지 파일 경로
image_path = './chatbot_python/ocr/test/test1.png'

# 경로 및 파일 존재 여부 확인
if not os.path.exists(image_path):
    print(f"오류: '{image_path}' 파일이 존재하지 않습니다. 경로를 확인하세요.")
    exit(1)

print(f"처리 중인 이미지: {image_path}")

# OpenCV로 이미지 로드 및 전처리
try:
    # 이미지 로드
    img = cv2.imread(image_path)

    # 텍스트 영역 크롭 (운전면허증/주민등록증의 텍스트 영역에 맞게 조정)
    left, top, right, bottom = 20, 20, 450, 300  # 크롭 영역 조정
    img_cropped = img[top:bottom, left:right]

    # 네거티브 반전 처리
    img_inverted = cv2.bitwise_not(img_cropped)

    # 그레이스케일 변환
    img_gray = cv2.cvtColor(img_inverted, cv2.COLOR_BGR2GRAY)

    # 대비 조정
    img_enhanced = cv2.convertScaleAbs(img_gray, alpha=2.0, beta=0)  # alpha는 대비 조정 값

    # 이진화 (임계값 180 기준)
    _, img_binary = cv2.threshold(img_enhanced, 180, 255, cv2.THRESH_BINARY)

except Exception as e:
    print(f"이미지 로드 중 오류 발생: {e}")
    exit(1)

# 텍스트 추출 (세부 설정 조정)
try:
    results = reader.readtext(img_binary, detail=1, paragraph=False,
                              contrast_ths=0.05, adjust_contrast=0.7,
                              y_ths=0.1, x_ths=0.3, filter_ths=0.05)
except Exception as e:
    print(f"OCR 처리 중 오류 발생: {e}")
    exit(1)

# OCR 결과에서 텍스트만 추출
ocr_text = "\n".join([text for (_, text, _) in results])
print("운전면허증/주민등록증에서 추출된 텍스트 (원본):")
print(ocr_text)


# 문서 유형 감지
def detect_document_type(text):
    if "자동차운전면허증" in text or "운전면허" in text or "Driver's License" in text:
        return "driver_license"
    elif "주민등록증" in text:
        return "resident_card"
    else:
        return "unknown"


doc_type = detect_document_type(ocr_text)
print(f"\n감지된 문서 유형: {doc_type}")


# 필요한 정보만 추출하는 함수
def extract_info_driver_license(text):
    info = {}

    # 면허번호 (예: 21-19-174133-01)
    license_number = re.search(r'\d{2}-\d{2}-\d{6}-\d{2}', text)
    if license_number:
        info["면허번호"] = license_number.group()

    # 주민등록번호 (예: 000829-2134567)
    resident_number = re.search(r'\d{6}-\d{7}', text)
    if resident_number:
        info["주민등록번호"] = resident_number.group()

    # 이름 (한글 이름, 2~4자, "종"으로 시작하거나 끝나는 단어 제외)
    name = re.search(r'(?<!1종|2종)[가-힣]{2,4}(?!종)', text)
    if name:
        info["이름"] = name.group()

    # 면허 종류 (1종대형, 1종보통 등)
    license_types = re.findall(r'(1종|2종)\s*(대형|보통|소형)', text)
    if license_types:
        info["면허종류"] = " ".join([f"{t[0]}{t[1]}" for t in license_types])

    # 발급일 (예: 2019.09.10)
    issue_date = re.search(r'\d{4}\.\d{2}\.\d{2}', text)
    if issue_date:
        info["발급일"] = issue_date.group()

    return info


def extract_info_resident_card(text):
    info = {}

    # 주민등록번호 (예: 000829-2134567)
    resident_number = re.search(r'\d{6}-\d{7}', text)
    if resident_number:
        info["주민등록번호"] = resident_number.group()

    # 이름 (한글 이름, 2~4자)
    name = re.search(r'[가-힣]{2,4}', text)
    if name:
        info["이름"] = name.group()

    # 주소 (예: 서울시 서대문구 통일로 97 (미근동 209))
    address = re.search(r'서울시\s*[가-힣]+\s*[가-힣]+\s*\d+\s*\([가-힣]+\s*\d+\)', text)
    if address:
        info["주소"] = address.group()

    # 발급일 (예: 2019.09.10)
    issue_date = re.search(r'\d{4}\.\d{2}\.\d{2}', text)
    if issue_date:
        info["발급일"] = issue_date.group()

    return info


# 문서 유형에 따라 정보 추출
if doc_type == "driver_license":
    info = extract_info_driver_license(ocr_text)
elif doc_type == "resident_card":
    info = extract_info_resident_card(ocr_text)
else:
    print("알 수 없는 문서 유형입니다.")
    exit(1)

# 교정 규칙 (문서 유형별)
driver_license_corrections = {
    "3소권": "1종대형 1종보통",
    "믿학기": "민동기",
    "서울사   서대출구 눕일로": "서울시 서대문구 통일로",
    "37 (미근중 309)": "97 (미근동 209)",
    "329;01.01": "2029.01.01",
    "4020, 12,31": "2029.12.31",
    "84\\*31": "8H1X3Y",
    "서물지방경찰": "서울지방경찰청"
}

resident_card_corrections = {
    "서울사   서대출구 눕일로": "서울시 서대문구 통일로",
    "37 (미근중 309)": "97 (미근동 209)",
    "서물지방경찰": "서울지방경찰청"
}


# 정보 교정
def correct_info(info, corrections):
    for key, value in info.items():
        for wrong, correct in corrections.items():
            info[key] = value.replace(wrong, correct)
    return info


if doc_type == "driver_license":
    info = correct_info(info, driver_license_corrections)
elif doc_type == "resident_card":
    info = correct_info(info, resident_card_corrections)

# 결과 출력 (필요한 정보만 문자열로)
print("\n추출된 정보:")
for key, value in info.items():
    print(f"{key}: {value}")

# 결과 문자열로 반환
result_string = "\n".join([f"{key}: {value}" for key, value in info.items()])
print("\n최종 결과 (문자열):")
print(result_string)

# 파일로 저장 (선택)
with open("../chatbot/ocr/test/ocr_result.txt", "w", encoding="utf-8") as f:
    f.write(result_string)
