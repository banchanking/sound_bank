import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import styles from '../../Css/fund/FundList.module.css';
import RefreshToken from '../../jwt/RefreshToken';

const Fund = ({ fundId, onClose, onBuy }) => {
  const [fundDetail, setFundDetail] = useState(null);

  // 🔍 진입 확인 로그
  console.log("🔥 Fund 컴포넌트 실행됨");
  console.log("➡️ props로 받은 fundId:", fundId);

  useEffect(() => {
    const fetchData = async () => {
      if (!fundId) {
        console.error("⛔ fundId 없음. API 호출 안함");
        return;
      }
      try {
        const url = `http://localhost:8081/api/fundDetail/${fundId}`;
        console.log("📡 API 호출 URL:", url);
        const res = await RefreshToken.get(url);
        console.log("✅ API 응답 데이터:", res.data);
        setFundDetail(res.data);
      } catch (err) {
        console.error("❌ API 호출 실패:", err);
      }
    };

    fetchData();
  }, [fundId]);

  if (!fundDetail) {
    return (
      <div className={styles.popupOverlay}>
        <div className={styles.popupChart}>⏳ 불러오는 중...</div>
      </div>
    );
  }

  const chartData = [
    ['기간', '수익률'],
    ['1M', parseFloat(fundDetail.return_1m)],
    ['3M', parseFloat(fundDetail.return_3m)],
    ['6M', parseFloat(fundDetail.return_6m)],
    ['12M', parseFloat(fundDetail.return_12m)],
  ];

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupChart}>
        <div className={styles.popupHeader}>
          <h3>{fundDetail.fund_name}</h3>
          <button className={styles.closeButton} onClick={onClose}>X</button>
        </div>
        <p><strong>운용사:</strong> {fundDetail.fund_company}</p>
        <p><strong>유형:</strong> {fundDetail.fund_type}</p>
        <p><strong>등급:</strong> {fundDetail.fund_grade}</p>

        <Chart
          chartType="LineChart"
          width="100%"
          height="300px"
          data={chartData}
        />

        <button onClick={() => onBuy(fundDetail)}>매수하기</button>
      </div>
    </div>
  );
};

export default Fund;
