import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import { useNavigate } from "react-router-dom";
import styles from "../../Css/fund/MyFund.module.css";

const CloseAccount = () => {
  const navigate = useNavigate();
  const [fundAccounts, setFundAccounts] = useState([]);
  const customer_id = localStorage.getItem("customerId");

  // 📌 펀드 계좌 목록 조회 함수
  const fetchFundAccounts = async () => {
    try {
      const customerId = localStorage.getItem("customerId");
      const res = await RefreshToken.get(`/accounts/allAccount/fund/${customerId}`);
      setFundAccounts(res.data);
    } catch (err) {
      console.error("계좌 조회 실패", err);
    }
  };

  // 📌 최초 마운트 시 계좌 목록 조회
  useEffect(() => {
    if (!customer_id) {
      const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
      if (goLogin) navigate("/login");
      else navigate("/");
      return;
    }
    fetchFundAccounts();
  }, []);

  // 📌 계좌 해지 요청 함수 (좌수 0이어야 신청 가능)
  const handleCloseAccount = async (fundAccountId) => {
    const account = fundAccounts.find((acc) => acc.fundAccountId === fundAccountId);

    if (!account) {
      alert("계좌 정보를 찾을 수 없습니다.");
      return;
    }

    if (account.fundBalance > 0) {
      alert("잔여 좌수가 남아 있어 해지할 수 없습니다.");
      return;
    }

    if (!window.confirm("정말로 이 펀드 계좌를 해지하시겠습니까?")) return;

    try {
      await RefreshToken.patch(`/fund/close/${fundAccountId}`);
      alert("해지 요청이 접수되었습니다. 관리자 승인 후 해지됩니다.");
      fetchFundAccounts();
    } catch (err) {
      console.error("해지 실패", err);
      alert("계좌 해지 중 오류 발생");
    }
  };

  return (
    <div align="center" className={styles.fundContainer}>
      <h2>My펀드 계좌해지</h2>
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
                    ? "거절 (잔여 좌수)"
                    : "승인 대기 중"}
                </span>
              </td>
              <td>
                {acc.status === "APPROVED" && (
                  <button
                    className={styles.fundCloseButton}
                    onClick={() => handleCloseAccount(acc.fundAccountId)}
                  >
                    해지하기
                  </button>
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