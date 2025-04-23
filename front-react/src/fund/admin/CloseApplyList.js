import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";

const CloseApplyList = () => {
  const [accounts, setAccounts] = useState([]);

  // DEACTIVE 상태인 해지 신청 계좌 목록 불러오기
  const fetchCloseApplyAccounts = async () => {
    try {
      const res = await RefreshToken.get("http://localhost:8081/api/admin/fundAccount/close-apply");
      setAccounts(res.data);
      console.log("불러온 계좌 목록:", res.data);
    } catch (err) {
      console.error("해지 신청 계좌 목록 조회 실패", err);
    }
  };

  // 해지 승인 처리 (상태 CLOSED로 변경)
  const handleApproveClose = async (fundAccountId) => {
    try {
      await RefreshToken.patch(`http://localhost:8081/api/admin/fundAccount/${fundAccountId}/closed`);
      alert("계좌 해지 승인 완료");
      fetchCloseApplyAccounts(); // 목록 갱신
    } catch (err) {
      console.error("해지 승인 실패", err);
      alert("해지 승인 처리 실패");
    }
  };

  useEffect(() => {
    fetchCloseApplyAccounts();
  }, []);

  return (
    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>계좌 해지 신청 목록</h2>
      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>계좌 ID</th>
            <th>고객 ID</th>
            <th>펀드 계좌 번호</th>
            <th>보유 계좌</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.fundAccountId || Math.random()} className={styles.fundRow}>
              <td>{acc.fundAccountId}</td>
              <td>{acc.customerId}</td>
              <td>{acc.fundAccountNumber}</td>
              <td>{acc.linkedAccountNumber}</td>
              <td>{acc.status}</td>
              <td>
                <button
                  onClick={() => handleApproveClose(acc.fundAccountId)}
                  className={styles.fundRejectBtn}
                >
                  해지 승인
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CloseApplyList;
