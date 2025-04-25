import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";
import FundCustomer from "../admin/FundCustomer";  // 로그인 체크용 팝업 컴포넌트

const CloseAccount = () => {
  const navigate = useNavigate();
  const [fundAccounts, setFundAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // 로그인 체크 + 계좌 조회
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }

    const fetchFundAccounts = async () => {
      try {
        const customerId = localStorage.getItem("customerId");
        const res = await RefreshToken.get(`http://localhost:8081/api/accounts/allAccount/fund/${customerId}`);
        setFundAccounts(res.data);
      } catch (err) {
        console.error("계좌 조회 실패", err);
      }
    };

    fetchFundAccounts();
  }, []);

  const handleCloseAccount = async (fundAccountId) => {
    if (!window.confirm("정말로 이 펀드 계좌를 해지하시겠습니까?")) return;

    try {
      await RefreshToken.patch(`/fund/close/${fundAccountId}`);
      alert("해지 요청이 접수되었습니다. 관리자 승인 후 해지됩니다.");
      // 계좌 목록 새로고침
      const customerId = localStorage.getItem("customerId");
      const res = await RefreshToken.get(`http://localhost:8081/api/accounts/allAccount/fund/${customerId}`);
      setFundAccounts(res.data);
    } catch (err) {
      console.error("해지 실패", err);
      alert("계좌 해지 중 오류 발생");
    }
  };
  
  // 모달 핸들러
  const handleConfirm = () => navigate("/login");
  const handleCancel = () => navigate("/");

  return (
    <>
    {showModal && (
      <FundCustomer
        message="로그인이 필요한 서비스입니다."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )}

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
                  ? "비활성 (Rejected)"
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
    </>
  );
};


export default CloseAccount;
