import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";

const OpenApplyList = () => {
  const [accounts, setAccounts] = useState([]);

  // 승인 대기 계좌 조회
  const fetchPendingAccounts = async () => {
    try {
      const res = await RefreshToken.get("http://localhost:8081/api/admin/fundAccount/pending");
      setAccounts(res.data);
    } catch (err) {
      console.error("계좌 목록 조회 실패", err);
    }
  };

  const handleApprove = async (fundAccountId) => {
    try {
      await RefreshToken.patch(`http://localhost:8081/api/admin/fundAccount/${fundAccountId}/approved`);
      alert("승인 완료");
      fetchPendingAccounts();
    } catch (err) {
      alert("승인 실패");
    }
  };

  const handleReject = async (fundAccountId) => {
    try {
      await RefreshToken.patch(`http://localhost:8081/api/admin/fundAccount/${fundAccountId}/rejected`);
      alert("거절 완료");
      fetchPendingAccounts();
    } catch (err) {
      alert("거절 실패");
    }
  };

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  return (
    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>펀드 계좌 승인 요청 목록</h2>
      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>계좌 ID</th>
            <th>고객 ID</th>
            <th>계좌번호</th>
            <th>보유계좌</th>
            <th>개설일</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.fundAccountId} className={styles.fundRow}>
              <td>{acc.fundAccountId}</td>
              <td>{acc.customerId}</td>
              <td>{acc.fundAccountNumber}</td>
              <td>{acc.linkedAccountNumber}</td>
              <td>{acc.fundOpenDate}</td>
              <td>
                <button onClick={() => handleApprove(acc.fundAccountId)} className={styles.fundApproveBtn}>승인</button>
                <button onClick={() => handleReject(acc.fundAccountId)} className={styles.fundRejectBtn}>거절</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpenApplyList;
