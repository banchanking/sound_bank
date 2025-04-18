import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import styles from '../../Css/fund/FundList.module.css';
import RefreshToken from '../../jwt/RefreshToken';

const Fund = ({ fundId, onClose, onBuy }) => {
  const [fundDetail, setFundDetail] = useState(null);
  const [buyAmount, setBuyAmount] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");
  const [unitCount, setUnitCount] = useState("");
  const [fundAccounts, setFundAccounts] = useState([]);
  const [selectedFundAccountId, setSelectedFundAccountId] = useState("");
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState("");
  const [selectedFundAccount, setSelectedFundAccount] = useState(null);

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

  useEffect(() => {
    const fetchFundAccounts = async () => {
      const customerId = localStorage.getItem("customerId");
      const res = await RefreshToken.get(`http://localhost:8081/api/accounts/allAccount/fund/${customerId}`);
      setFundAccounts(res.data);
    };
    fetchFundAccounts();
  }, []);

  if (!fundDetail) {
    return (
      <div className={styles.popupOverlay}>
        <div className={styles.popupChart}>⏳ 불러오는 중...</div>
      </div>
    );
  }

  //  쉼표 포맷 핸들러 함수 추가
  const handleAmountChange = (e) => {   
    const raw = e.target.value.replace(/,/g, "");
    if (!isNaN(raw)) {
      setBuyAmount(raw);
      setFormattedAmount(Number(raw).toLocaleString());
    }
  };

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

        {/* 금액 입력 필드 */}
        <div className={styles.inputGroup}>
        <label>펀드 계좌 선택</label>
        <select
          value={selectedFundAccountId}
          onChange={(e) => {
            const selected = fundAccounts.find(a => a.fundAccountId === e.target.value);
            setSelectedFundAccountId(e.target.value);
            setWithdrawAccountNumber(selected?.linkedAccountNumber || "");
            setSelectedFundAccount(selected);
          }}
        >
          <option value="">계좌를 선택하세요</option>
          {fundAccounts.map((acc) => (
            <option key={acc.fundAccountId} value={acc.fundAccountId}>
              {acc.fundAccountName} ({acc.fundAccountNumber}) / (출금: {acc.linkedAccountNumber})
            </option>
          ))}
        </select>

          <label>매수 금액 (원)</label>
          <input
            type="text"
            value={formattedAmount}
            onChange={handleAmountChange}
            placeholder="예: 1,000,000"
          />

          <label>매수 좌수 (선택사항)</label>
          <input
            type="number"
            value={unitCount}
            onChange={(e) => setUnitCount(e.target.value)}
            placeholder="매수할 좌수 입력"
          />
        </div>
        
        {/* 매수 버튼 */}
        <div className={styles.fundbuttonGroup}>
          <button
            onClick={() => {
              alert("매수 신청이 완료되었습니다. 관리자 승인 후 계좌에 반영됩니다.");
              onBuy({ ...fundDetail, buyAmount, unitCount, fundAccountId: selectedFundAccountId, withdrawAccountNumber, fundAccountName: selectedFundAccount?.fundAccountName });
            }}
            className={styles.fundBuyButton}
          >
            매수하기
          </button>
        </div>

        <div className={styles.fundbuttonGroup}>
          <button onClick={() => window.location.href = "/inquireAccont"} className={styles.fundButton}>
            My계좌 이동
          </button>
          <button onClick={() => window.location.href = "/myFund"} className={styles.fundButton}>
            My펀드 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default Fund;
