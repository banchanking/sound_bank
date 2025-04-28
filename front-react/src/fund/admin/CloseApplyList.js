import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";

const CloseApplyList = () => {
  const [accounts, setAccounts] = useState([]);

  // DEACTIVE 상태인 해지 신청 계좌 목록 불러오기
  const fetchCloseApplyAccounts = async () => {
    console.log("fetchCloseApplyAccounts 호출됨"); // 호출 여부 확인
    try {
      const res = await RefreshToken.get("/admin/fundAccount/close-apply");
      console.log("API 응답 데이터:", res.data); // 응답 데이터 출력
      setAccounts(Array.isArray(res.data) ? res.data : []); // 배열인지 확인 후 설정
    } catch (err) {
      console.error("해지 신청 계좌 목록 조회 실패", err); // 오류 출력
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // 날짜가 없을 경우
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // 해지 승인 처리
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

  // 해지 거절 처리
  const handleRejectClose = async (fundAccountId) => {
    try {
      await RefreshToken.patch(`/admin/fundAccount/${fundAccountId}/rejected`);
      alert("거절 완료");
      fetchCloseApplyAccounts(); // 목록 갱신
    } catch (err) {
      console.error("거절 실패", err);
      alert("거절 처리 실패");
    }
  };

  // 컴포넌트가 렌더링될 때 계좌 목록 조회
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
              <tr key={acc.fundAccountId || Math.random()} className={styles.fundRow}>
                <td>{acc.fundAccountId}</td>
                <td>{acc.customerId}</td>
                <td>{acc.fundAccountNumber}</td>
                <td>{acc.linkedAccountNumber}</td>
                <td>{formatDate(acc.fundOpenDate)}</td> {/* 날짜 포맷팅 */}
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