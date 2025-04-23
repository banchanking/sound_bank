import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";
import MyFund from "../customer/MyFund";  // 로그인 체크용 팝업 컴포넌트

const FindFundCustomer = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // 거래 목록 조회
  const fetchPendingTransactions = async () => {
    try {
      const res = await RefreshToken.get("/pending-check");
      setTransactions(res.data);
    } catch (error) {
      console.error("조회 실패", error);
    }
  };

  // 승인/거절 처리
  const updateStatus = async (fundTransactionId, status) => {
    try {
      await RefreshToken.put(`/fundTrade/${fundTransactionId}/${status.toLowerCase()}`);
      alert(`${status === "APPROVED" ? "승인" : "거절"} 처리 완료`);
      fetchPendingTransactions();
    } catch (err) {
      console.error("처리 실패", err);
    }
  };

  // ✅ 로그인 확인 + 거래 데이터 불러오기
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }

    fetchPendingTransactions();
  }, []);

  const handleConfirm = () => navigate("/login");
  const handleCancel = () => navigate("/");

  return (
    <>
    {showModal && (
      <MyFund
        message="로그인이 필요한 서비스입니다."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )}

    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>펀드 거래 승인 요청</h2>
      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>거래ID</th>
            <th>고객 ID</th>
            <th>펀드 ID</th>
            <th>투자 금액</th>
            <th>좌수</th>
            <th>신청일</th>
            <th>거래유형</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            console.log("거래 ID:", tx.fundTransactionId);
            return (
            <tr key={tx.fundTransactionId} className={styles.fundRow}>
              <td>{tx.fundTransactionId}</td>
              <td>{tx.customerId}</td>
              <td>{tx.fundId}</td>
              <td>{tx.fundInvestAmount?.toLocaleString()}</td>
              <td>{tx.fundUnitsPurchased}</td>
              <td>{tx.fundTransactionDate}</td>
              <td>{tx.fundTransactionType}</td>
              <td>{tx.status}</td>
              <td>
                <button className={styles.fundApproveBtn} onClick={() => updateStatus(tx.fundTransactionId, "APPROVED")}>승인</button>
                <button className={styles.fundRejectBtn} onClick={() => updateStatus(tx.fundTransactionId, "REJECTED")}>거절</button>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default FindFundCustomer;
