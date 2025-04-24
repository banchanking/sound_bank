import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";
import MyFund from "./MyFund";  // 로그인 체크용 팝업 컴포넌트
import { Chart } from "react-google-charts";
import Papa from "papaparse";
import dayjs from "dayjs";

const TransHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [password, setPassword] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [fundRates, setFundRates] = useState({}); // 펀드 ID → 수익률 매핑
  const [showModal, setShowModal] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(true); // 로딩상태 추가

  // 로그인 체크
  useEffect(() => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setShowModal(true);
        return;
      }

      fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const customerId = localStorage.getItem("customerId");
    const res = await RefreshToken.get(`/fundTrade/all/${customerId}`);
    setTransactions(res.data.filter(tx => tx.fundTransactionType === "BUY"));
  };

  // CSV 파싱 후 상태 업데이트
  useEffect(() => {
    Papa.parse("/data/fundList_updated.csv", {
      header: true,
      download: true,
      complete: (results) => {
        const fundRateMap = {};
        results.data.forEach((fund) => {
          const fundName = fund.fund_name;
  
          if (fundName && typeof fundName === "string" && fundName.trim()) {  // null 및 undefined 처리
            fundRateMap[fundName.trim()] = {
              return_1m: parseFloat(fund.return_1m || 0),
              return_3m: parseFloat(fund.return_3m || 0),
              return_6m: parseFloat(fund.return_6m || 0),
              return_12m: parseFloat(fund.return_12m || 0),
            };
          }
        });
        setFundRates(fundRateMap);
        setIsLoadingRates(false);
        console.log("🔵 CSV에서 불러온 펀드 수익률 데이터:", fundRateMap);
      },
    });
  }, []);
  
  const getApproximateRate = (tx, rateMap) => {
    const rates = rateMap[tx.fundName];  // 🔵 fundName으로 변경
    if (!rates) return 0;
  
    const daysHeld = dayjs().diff(dayjs(tx.fundTransactionDate), "day");
    if (daysHeld <= 30) return rates.return_1m;
    if (daysHeld <= 90) return rates.return_3m;
    if (daysHeld <= 180) return rates.return_6m;
    return rates.return_12m;
  };
  
  const getProfitRate = (tx, rateMap) => {
    const approxRate = getApproximateRate(tx, rateMap); // 현재 수익률 (%)
    const currentValue = tx.fundInvestAmount * (1 + approxRate / 100);
    const profitRate = ((currentValue - tx.fundInvestAmount) / tx.fundInvestAmount) * 100;
    return profitRate.toFixed(2);
  };

  const handleSellClick = (tx) => {
    setSelectedTx(tx); // 환매 대상 선택
    console.log("🚀 선택한 거래 즉시확인:", tx);
  };

  useEffect(() => {
    if (selectedTx) {
      console.log("📌 선택된 거래 펀드명:", selectedTx.fundName);
      console.log("📌 CSV fundRates 데이터:", fundRates);
      if(selectedTx.fundName){
        console.log("📌 매핑확인:", fundRates[selectedTx.fundName.trim()]);
      }
    }
  }, [selectedTx, fundRates]);

  const handleSellConfirm = async () => {
    if (!selectedTx) return;
    console.log("🔥 환매 요청에 포함된 selectedTx 정보:", selectedTx);
    
    const res = await RefreshToken.post("/fund/check-password", {
      linkedAccountNumber: selectedTx.withdrawAccountNumber,
      fundAccountPassword: password
    });

    if (res.status === 200) {
      await RefreshToken.post("/fundTrade", {
        ...selectedTx,
        fundTransactionType: "SELL",
        fundTransactionDate: null, // 백엔드에서 현재 일자로 처리
        status: "PENDING"
      });
      alert("환매 신청 완료");
      fetchTransactions();
    } else {
      alert("비밀번호가 틀렸습니다");
    }
  };

  return (
    <>
      {showModal && (
        <MyFund
          message="로그인이 필요한 서비스입니다."
          onConfirm={() => navigate("/login")}
          onCancel={() => navigate("/")}
        />
      )}

    <div align="center" className={styles.fundContainer}>
      <h2>My펀드 거래내역</h2>
      <table className={styles.fundTable}> 
        <thead>
          <tr>
            <th>펀드 ID</th>
            <th>펀드명</th>
            <th>금액</th>
            <th>좌수</th>
            <th>단가</th>
            <th>거래일</th>
            <th>환매</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.fundTransactionId}>
              <td>{tx.fundId}</td>
              <td>{tx.fundName}</td>
              <td>{tx.fundInvestAmount?.toLocaleString()}</td>
              <td>{tx.fundUnitsPurchased}</td>
              <td>{tx.fundPricePerUnit}</td>
              <td>{dayjs(tx.fundTransactionDate).format("YYYY-MM-DD")}</td>
              <td>
                <button onClick={() => handleSellClick(tx)}>환매하기</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTx && 
      !isLoadingRates && selectedTx.fundName && fundRates[selectedTx.fundName.trim()] && (
          <div style={{ marginTop: "1rem" }}>
            <h4>수익률 비교</h4>
            <Chart
              chartType="ColumnChart"
              data={[
                ["시점", "수익률"],
                ["매수 시점", 0],
                ["현재 시점", parseFloat(getProfitRate(selectedTx, fundRates)) / 100],
              ]}
              options={{
                legend: { position: "none" },
                colors: ["#4caf50"],
                vAxis: { format: "#.##%", title: "수익률" },
                animation: { startup: true, duration: 800, easing: "out" },
              }}
              width="100%"
              height="300px"
            />
            <h4>환매 비밀번호 입력</h4>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="펀드 계좌 비밀번호"
            />
            <button onClick={handleSellConfirm}>환매 확인</button>
          </div>
        )}
      </div>
    </>
  );
};

export default TransHistory;