import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";
import MyFund from "./MyFund";  // 로그인 체크용 팝업 컴포넌트

const MyFundInfo = () => {
  const navigate = useNavigate();
  const [closedAccounts, setClosedAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // 로그인 체크 + 해지된 계좌 불러오기
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }

    const fetchClosedAccounts = async () => {
      try {
        const customerId = localStorage.getItem("customerId");
        const res = await RefreshToken.get(
          `/fundAccount/closed/${customerId}`
        );
        setClosedAccounts(res.data);
      } catch (error) {
        console.error("해지된 계좌 조회 실패", error);
      }
    };

    fetchClosedAccounts();
  }, []);

  // 모달 핸들러
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
      <h2 className={styles.fundTitle}>해지된 펀드 계좌 목록</h2>
      {closedAccounts.length > 0 ? (
        <table className={styles.fundTable}>
          <thead>
            <tr>
              <th>계좌번호</th>
              <th>계좌명</th>
              <th>보유계좌</th>
              <th>잔액</th>
              <th>해지일</th>
            </tr>
          </thead>
          <tbody>
            {closedAccounts.map((acc) => (
              <tr key={acc.fundAccountNumber}>
                <td>{acc.fundAccountNumber}</td>
                <td>{acc.fundAccountName || "-"}</td>
                <td>{acc.linkedAccountNumber || "-"}</td>
                <td>{acc.fundBalance.toLocaleString()}원</td>
                <td>
                  {acc.closeDate
                    ? new Date(acc.closeDate).toLocaleDateString("ko-KR")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>해지된 계좌가 없습니다.</p>
      )}
    </div>
    </>
  );
};

export default MyFundInfo;

