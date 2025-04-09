import pandas as pd
import requests
from itertools import count
import io  # 파일 입출력
import sys
from dotenv import load_dotenv
import os



# python 표준 출력 스트림(sys.stdout)의 인코딩을 UTF-8로 변경하는 코드
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


load_dotenv()

api_key = os.getenv('accessToken')

pageSize = 10
totallist = list()

for pageNumber in count():
    if pageNumber >= 10:  # pageNo가 10이 되었을 때 루프를 종료
        break
    numOfRows = str(pageSize)
    pageNo = str(pageNumber + 1)
    url = 'https://api.odcloud.kr/api/15020770/v1/uddi:255bef4b-49cd-4e6c-9c32-b86f51ffbef6?page=1&perPage=50&serviceKey='
    url += {'accessToken'}
    url += '&numOfRows=' + numOfRows + '&pageNo=' + pageNo
    url += '&resultType=json'
    print(url)

    try:
        response = requests.get(url, verify=False)  # SSL 인증서 검증 비활성화
        response.raise_for_status()  # HTTP 오류 발생 시 예외 발생
        print("response =>", response)
        jsondata = response.json()
        print(jsondata)  # JSON 응답 구조를 출력하여 확인

        try:
            datalist = jsondata['data']
            if not datalist:
                print('데이터가 비어 있습니다.')
                break
            for data in datalist:
                totallist.append(data)
        except KeyError as key_err:
            print('키 오류:', key_err)
            break
    except requests.exceptions.RequestException as req_err:
        print('HTTP 요청 실패:', req_err)
        break
    except Exception as err:
        print('오류 발생:', err)
        break

# csv 파일로 open하기 위해 JSON 데이터를 DataFrame으로 변환
funds = pd.DataFrame(totallist)

# 컬럼 이름 매핑 (한국어 컬럼명을 원하는 이름으로 변경)
funds.rename(columns={
    "1개월누적수익률(퍼센트)": "return_1m",
    "3개월누적수익률(퍼센트)": "return_3m",
    "6개월누적수익률(퍼센트)": "return_6m",
    "12개월누적수익률(퍼센트)": "return_12m",
    "선취수수료(퍼센트)": "fund_upfront_fee",
    "총보수(퍼센트)": "fund_fee_rate",
    "상품명": "fund_name",
    "운용사명": "fund_company",
    "펀드등급": "fund_grade",
    "펀드유형": "fund_type"
}, inplace=True)

# fund_risk_type 컬럼 추가 (기본값 설정)
funds["fund_risk_type"] = "투자성향"  # 기본값으로 "투자성향" 설정

# JSON 데이터를 CSV 파일로 변환하여 저장
filename = 'D:/DEV/workspace_springBoot_ict04/sound_bank/front-react/public/data/fundList.csv'

funds.to_csv(filename, index=False, encoding='utf-8-sig')  # 인덱스 없이 UTF-8(BOM)으로 저장

print('저장 완료 =>', filename)