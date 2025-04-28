import pandas as pd
import requests
from bs4 import BeautifulSoup

# 크롤링할 URL
url = 'https://finance.naver.com/fund/fundFindDetail.naver'

# URL 요청
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

funds = []

# 테이블에서 데이터 추출
for fund in soup.select('table.type_1 tbody tr'):
    tds = fund.select('td')
    if len(tds) > 1:
        funds.append({
            'fund_name': tds[0].text.strip(),
            'fund_company': tds[1].text.strip(),
            'fund_type': tds[2].text.strip(),
            'fund_grade': tds[3].text.strip(),
            'fund_fee_rate': tds[4].text.strip(),
            'fund_upfront_fee': tds[5].text.strip(),
            'return_1m': tds[6].text.strip(),
            'return_3m': tds[7].text.strip(),
            'return_6m': tds[8].text.strip(),
            'return_12m': tds[9].text.strip(),
            'fund_risk_type': tds[10].text.strip(),
        })

# ✅ fund_name 기준으로 중복 제거
unique_funds = { fund['fund_name']: fund for fund in funds }.values()

# 고유한 펀드 리스트를 DataFrame으로 변환
df = pd.DataFrame(unique_funds)

# CSV로 저장
df.to_csv('fundList.csv', index=False)

print(f"✅ 중복 제거 후 저장 완료! 총 {len(df)}개 펀드 저장됨")
