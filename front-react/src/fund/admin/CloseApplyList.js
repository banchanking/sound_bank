import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";

const CloseApplyList = () => {
  const [accounts, setAccounts] = useState([]); // 계좌 목록 상태

  // 📌 해지 신청 목록 조회 함수
  const fetchCloseApplyAccounts = async () => {
    try {
      const res = await RefreshToken.get("/admin/fundAccount/close-apply");
      setAccounts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("해지 신청 계좌 목록 조회 실패", err);
    }
  };

  // 📌 날짜 포맷팅 함수 (YYYY/MM/DD)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  };

  // 📌 해지 승인 처리 (좌수 0인지 체크 후 승인)
  const handleApproveClose = async (fundAccountId) => {
    try {
      const account = accounts.find((acc) => acc.fundAccountId === fundAccountId);
      if (!account) {
        alert("계좌 정보를 찾을 수 없습니다.");
        return;
      }
      if (account.fundBalance > 0) {
        alert("잔여 좌수가 남아 있어 해지할 수 없습니다.");
        return;
      }
      await RefreshToken.patch(`/admin/fundAccount/${fundAccountId}/closed`);
      alert("계좌 해지 승인 완료");
      fetchCloseApplyAccounts();
    } catch (err) {
      console.error("해지 승인 실패", err);
      alert("해지 승인 처리 실패");
    }
  };

  // 📌 해지 거절 처리 (거절 사유 없이 단순 거절)
  const handleRejectClose = async (fundAccountId) => {
    try {
      await RefreshToken.patch(`/admin/fundAccount/${fundAccountId}/rejected`);
      alert("거절 완료");
      fetchCloseApplyAccounts();
    } catch (err) {
      console.error("거절 실패", err);
      alert("거절 처리 실패");
    }
  };

  // 📌 최초 로드 시 해지 신청 목록 조회
  useEffect(() => {
    fetchCloseApplyAccounts();
  }, []);

  return (
    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>계좌 해지신청 목록</h2>

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
          {accounts.length > 0 ? (
            accounts.map((acc) => (
              <tr key={acc.fundAccountId} className={styles.fundRow}>
                <td>{acc.fundAccountId}</td>
                <td>{acc.customerId}</td>
                <td>{acc.fundAccountNumber}</td>
                <td>{acc.linkedAccountNumber}</td>
                <td>{formatDate(acc.fundOpenDate)}</td>
                <td>
                  {acc.status === "DEACTIVE"
                    ? "해지 요청"
                    : acc.status === "CLOSED"
                    ? "해지 완료"
                    : acc.status === "REJECTED"
                    ? "해지 거절"
                    : acc.status}
                </td>
                <td>
                  <button
                    onClick={() => handleApproveClose(acc.fundAccountId)}
                    className={styles.fundApproveBtn}
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleRejectClose(acc.fundAccountId)}
                    className={styles.fundRejectBtn}
                  >
                    거절
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                계좌 목록이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CloseApplyList;
