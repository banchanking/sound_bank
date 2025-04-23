import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";
import MyFund from "../customer/MyFund";  // 로그인 체크용 팝업 컴포넌트

const CloseApplyList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // DEACTIVE 상태인 해지 신청 계좌 목록 불러오기
  const fetchCloseApplyAccounts = async () => {
    try {
      const res = await RefreshToken.get("/admin/fundAccount/close-apply");
      setAccounts(res.data);
      console.log("불러온 계좌 목록:", res.data);
    } catch (err) {
      console.error("해지 신청 계좌 목록 조회 실패", err);
    }
  };

  // 로그인 체크 + 데이터 fetch 한번에 처리
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }

    fetchCloseApplyAccounts();
  }, []);

  // 해지 승인 처리 (상태 CLOSED로 변경)
  const handleApproveClose = async (fundAccountId) => {
    try {
      await RefreshToken.patch(`/admin/fundAccount/${fundAccountId}/closed`);
      alert("계좌 해지 승인 완료");
      fetchCloseApplyAccounts(); // 목록 갱신
    } catch (err) {
      console.error("해지 승인 실패", err);
      alert("해지 승인 처리 실패");
    }
  };

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
    </>
  );
};

export default CloseApplyList;
