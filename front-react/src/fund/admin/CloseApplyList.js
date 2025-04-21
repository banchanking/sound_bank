import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css"; // 공통 스타일 재사용

const CloseApplyList = () => {
  const [sellRequests, setSellRequests] = useState([]);

  // 환매 요청 목록 조회
  const fetchPendingSells = async () => {
    try {
      const res = await RefreshToken.get("http://localhost:8081/api/fundTrade/sell");
      setSellRequests(res.data);
    } catch (err) {
      console.error("환매 요청 조회 실패", err);
    }
  };

  // 승인 / 거절 처리
  const updateStatus = async (transactionId, status) => {
    try {
      await RefreshToken.put(`http://localhost:8081/api/fundTrade/${transactionId}/${status.toLowerCase()}`);
      alert(`${status === "APPROVED" ? "승인" : "거절"} 처리 완료`);
      fetchPendingSells(); // 리스트 갱신
    } catch (err) {
      console.error("처리 실패", err);
      alert("처리 중 오류 발생");
    }
  };

  useEffect(() => {
    fetchPendingSells();
  }, []);

  return (
    <div className={styles.fundAdminContainer}>
      <h2>펀드 환매 승인 요청 목록</h2>
      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>고객 ID</th>
            <th>펀드 ID</th>
            <th>투자 금액</th>
            <th>매도 좌수</th>
            <th>요청일</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {sellRequests.map((tx) => (
            <tr key={tx.fundTransactionId}>
              <td>{tx.customerId}</td>
              <td>{tx.fundId}</td>
              <td>{tx.fundInvestAmount?.toLocaleString()} 원</td>
              <td>{tx.fundUnitsPurchased}</td>
              <td>{tx.fundTransactionDate}</td>
              <td>
                <span className={`${styles.status} ${styles.pending}`}>승인 대기</span>
              </td>
              <td>
                <button onClick={() => updateStatus(tx.fundTransactionId, "APPROVED")}>승인</button>
                <button onClick={() => updateStatus(tx.fundTransactionId, "REJECTED")}>거절</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CloseApplyList;
