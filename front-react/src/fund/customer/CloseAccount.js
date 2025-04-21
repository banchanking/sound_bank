import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";

const CloseAccount = () => {
  const [fundAccounts, setFundAccounts] = useState([]);

  const fetchFundAccounts = async () => {
    try {
      const customerId = localStorage.getItem("customerId");
      const res = await RefreshToken.get(`http://localhost:8081/api/accounts/allAccount/fund/${customerId}`);
      setFundAccounts(res.data);
    } catch (err) {
      console.error("계좌 조회 실패", err);
    }
  };

  useEffect(() => {
    fetchFundAccounts();
  }, []);

  const handleCloseAccount = async (fundAccountId) => {
    if (!window.confirm("정말로 이 펀드 계좌를 해지하시겠습니까?")) return;

    try {
      await RefreshToken.patch(`http://localhost:8081/api/fund/close/${fundAccountId}`);
      alert("계좌가 해지되었습니다.");
      fetchFundAccounts(); // 계좌 목록 새로고침
    } catch (err) {
      console.error("해지 실패", err);
      alert("계좌 해지 중 오류 발생");
    }
  };

  return (
    <div align="center" className={styles.fundContainer}>
      <h2>내 펀드 계좌</h2>
      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>계좌번호</th>
            <th>계좌이름</th>
            <th>상태</th>
            <th>해지</th>
          </tr>
        </thead>
        <tbody>
          {fundAccounts.map((acc) => (
            <tr key={acc.fundAccountId}>
              <td>{acc.fundAccountNumber}</td>
              <td>{acc.fundAccountName || "이름 없음"}</td>
              <td>
                <span
                className={`${styles.fundstatus} ${
                  acc.status === "APPROVED"
                    ? styles.fundapproved
                    : acc.status === "REJECTED"
                    ? styles.fundrejected
                    : styles.fundpending
                }`}
              >
                {acc.status === "APPROVED"
                  ? "활성 (Active)"
                  : acc.status === "REJECTED"
                  ? "비활성 (Deactivated)"
                  : "승인 대기 중"}
                </span>
              </td>
              <td>
              {acc.status === "APPROVED" && (
                <button onClick={() => handleCloseAccount(acc.fundAccountId)}>해지하기</button>
              )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default CloseAccount;
