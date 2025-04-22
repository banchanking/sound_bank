import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";

const MyFundInfo = () => {
  const [closedAccounts, setClosedAccounts] = useState([]);

  // 해지된 계좌 불러오기
  useEffect(() => {
    const fetchClosedAccounts = async () => {
      try {
        const customerId = localStorage.getItem("customerId");
        const res = await RefreshToken.get(
          `http://localhost:8081/api/fundAccount/closed/${customerId}`
        );
        setClosedAccounts(res.data);
      } catch (error) {
        console.error("해지된 계좌 조회 실패", error);
      }
    };

    fetchClosedAccounts();
  }, []);

  return (
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
  );
};

export default MyFundInfo;

