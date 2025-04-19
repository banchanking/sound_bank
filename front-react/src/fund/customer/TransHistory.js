import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";
import { Chart } from "react-google-charts";
import Papa from "papaparse";
import dayjs from "dayjs";

const TransHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [password, setPassword] = useState("");
  const [selectedTx, setSelectedTx] = useState(null);
  const [fundRates, setFundRates] = useState({}); // 펀드 ID → 수익률 매핑

  const fetchTransactions = async () => {
    const customerId = localStorage.getItem("customerId");
    const res = await RefreshToken.get(`http://localhost:8081/api/fundTrade/buy-approve/${customerId}`);
    setTransactions(res.data.filter(tx => tx.fundTransactionType === "BUY")); // 매수만
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSellClick = (tx) => {
    setSelectedTx(tx); // 환매 대상 선택
  };

  const handleSellConfirm = async () => {
    if (!selectedTx) return;
    const res = await RefreshToken.post("http://localhost:8081/api/fund/check-password", {
      linkedAccountNumber: selectedTx.withdrawAccountNumber,
      fundAccountPassword: password
    });

    if (res.status === 200) {
      await RefreshToken.post("http://localhost:8081/api/fundTrade/sell", {
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

  // CSV 파싱 + 펀드 ID별 수익률 매핑
  useEffect(() => {
    Papa.parse("../../../public/data/fundList_updated.csv", {
      header: true,
      download: true,
      complete: (results) => {
        console.log("✅ CSV 파싱 결과:", results.data);
      }
    });
  }, []);

  const getApproximateRate = (tx, rateMap) => {
    const rates = rateMap[tx.fundId];
    if (!rates) return 0;
  
    const daysHeld = dayjs().diff(dayjs(tx.fundTransactionDate), "day");
  
    if (daysHeld <= 30) return rates.return_1m;
    if (daysHeld <= 90) return rates.return_3m;
    if (daysHeld <= 180) return rates.return_6m;
    return rates.return_12m;
  };

  return (
    <div align="center" className={styles.fundContainer}>
      <h2>펀드 매수 내역</h2>
      <table className={styles.fundTable}> 
        <thead>
          <tr>
            <th>펀드 ID</th>
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
              <td>{tx.fundInvestAmount?.toLocaleString()}</td>
              <td>{tx.fundUnitsPurchased}</td>
              <td>{tx.fundPricePerUnit}</td>
              <td>{tx.fundTransactionDate}</td>
              <td>
                <button onClick={() => handleSellClick(tx)}>환매하기</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTx && (
        <div style={{ marginTop: "1rem" }}>
              <h4>수익률 비교</h4>
              <Chart
                chartType="ColumnChart"
                data={[
                  ["시점", "수익률"],
                  ["매수 시점", 0], // 기준선 0 (근사값(보유일수 기준으로 return_1m~12m)으로 현재 수익률을 유추)
                  ["현재 시점", getApproximateRate(selectedTx, fundRates) / 100]
                ]}
                width="100%"
                height="300px"
                options={{
                  legend: { position: "none" },
                  colors: ["#333"],
                  vAxis: { format: "#.##%" },
                }}
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
  );
};

export default TransHistory;
