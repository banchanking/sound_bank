import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import FundCustomer from "./FundCustomer";  // 로그인 체크용 팝업 컴포넌트
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";

const OpenApplyList = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // 승인 대기 계좌 조회
  const fetchPendingAccounts = async () => {
    try {
      const res = await RefreshToken.get("/admin/fundAccount/pending");
      setAccounts(res.data);
    } catch (err) {
      console.error("계좌 목록 조회 실패", err);
    }
  };

  const handleApprove = async (fundAccountId) => {
    try {
      await RefreshToken.patch(`/admin/fundAccount/${fundAccountId}/approved`);
      alert("승인 완료");
      fetchPendingAccounts();
    } catch (err) {
      alert("승인 실패");
    }
  };

  const handleReject = async (fundAccountId) => {
    try {
      await RefreshToken.patch(`/admin/fundAccount/${fundAccountId}/rejected`);
      alert("거절 완료");
      fetchPendingAccounts();
    } catch (err) {
      alert("거절 실패");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }

    fetchPendingAccounts();
  }, []);

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

    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>계좌 개설신청 목록</h2>
      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>계좌 ID</th>
            <th>고객 ID</th>
            <th>펀드계좌 번호</th>
            <th>보유 계좌</th>
            <th>개설일</th>
            <th>처리상태</th>
            <th>선택</th>
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
                {acc.status === 'PENDING'
                  ? "승인 대기 중"
                  : acc.status === 'APPROVED'
                  ? "승인 완료"
                  : acc.status === 'REJECTED'
                  ? "승인 거절"
                  : acc.status}
              </td>
              <td>
                <button onClick={() => handleApprove(acc.fundAccountId)} className={styles.fundApproveBtn}>승인</button>
                <button onClick={() => handleReject(acc.fundAccountId)} className={styles.fundRejectBtn}>거절</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default OpenApplyList;
