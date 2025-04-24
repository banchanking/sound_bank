import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";

const CustomerTransHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await RefreshToken.get("/admin/fundTrade/all");
        setTransactions(res.data);
      } catch (err) {
        console.error("전체 거래내역 불러오기 실패", err);
      }
    };
    fetchData();
  }, []);

  const calculateReturnRate = (price, current) => {
    if (!price || !current) return "-";
    const rate = ((current - price) / price) * 100;
    return rate.toFixed(2) + "%";
  };

  const filtered = transactions.filter(
    (tx) =>
      tx.customerId?.toLowerCase().includes(search.toLowerCase()) ||
      tx.fund_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>SoundBank 고객 펀드 거래내역</h2>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="고객 ID 또는 펀드명 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>고객ID</th>
            <th>펀드명</th>
            <th>거래일</th>
            <th>거래유형</th>
            <th>투자금액</th>
            <th>단가</th>
            <th>좌수</th>
            <th>현재가</th>
            <th>수익률</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((tx) => (
            <tr key={tx.fundTransactionId}>
              <td>{tx.customerId}</td>
              <td>{tx.fund_name}</td>
              <td>{tx.fundTransactionDate}</td>
              <td>{tx.fundTransactionType}</td>
              <td>{tx.fundInvestAmount?.toLocaleString()}</td>
              <td>{tx.fundPricePerUnit}</td>
              <td>{tx.fundUnitsPurchased}</td>
              <td>{tx.fundCurrentValue}</td>
              <td>{calculateReturnRate(tx.fundPricePerUnit, tx.fundCurrentValue)}</td>
              <td>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTransHistory;
