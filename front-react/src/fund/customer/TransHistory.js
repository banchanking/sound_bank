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
    const res = await RefreshToken.get(`/fundTrade/buy-approve/${customerId}`);
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
  Papa.parse("/data/fundList_updated.csv", {
    header: true,
    download: true,
    complete: (results) => {
      const fundRateMap = {};
      results.data.forEach((fund) => {
        fundRateMap[Number(fund.fund_id)] = {
          return_1m: parseFloat(fund.return_1m || 0),
          return_3m: parseFloat(fund.return_3m || 0),
          return_6m: parseFloat(fund.return_6m || 0),
          return_12m: parseFloat(fund.return_12m || 0),
        };
      });
      setFundRates(fundRateMap);
    },
  });

  const getApproximateRate = (tx, rateMap) => {
    const rates = rateMap[tx.fundId];
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

  return (
    <div align="center" className={styles.fundContainer}>
      <h2>My펀드 거래내역</h2>
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
              <td>{dayjs(tx.fundTransactionDate).format("YYYY-MM-DD")}</td>
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
                  ["매수 시점", 0], // 기준 0
                  ["현재 시점", parseFloat(getProfitRate(selectedTx, fundRates)) / 100]
                ]}
                width="100%"
                height="300px"
                options={{
                  legend: { position: "none" },
                  colors: ["#4caf50"],
                  vAxis: { format: "#.##%", title: "수익률" },
                  animation: {
                    startup: true,
                    duration: 800,
                    easing: "out",
                  },
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
