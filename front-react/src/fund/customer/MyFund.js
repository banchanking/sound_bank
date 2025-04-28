import React from "react";
import styles from "../../Css/fund/MyFund.module.css";

const MyFund = ({ type, onClose, transactions, closedAccounts, onSellRequest }) => {
  const titleMap = {
    BUY: "펀드 매수 내역",
    SELL: "펀드 환매 내역",
    CLOSED: "해지된 펀드 계좌",
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A"; // 날짜가 없거나 유효하지 않을 경우
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  const filtered = type === "BUY"
    ? transactions.filter(tx => tx.fundTransactionType === "BUY")
    : type === "SELL"
    ? transactions.filter(tx => tx.fundTransactionType === "SELL" && tx.status === "APPROVED")
    : closedAccounts;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* 제목과 닫기 버튼을 같은 행에 배치 */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{titleMap[type]}</h3>
          <button onClick={onClose} className={styles.modalClose}>닫기</button>
        </div>
        <table className={styles.fundTable}>
          <thead>
            <tr>
              <th>펀드명</th>
              <th>투자금액</th>
              <th>좌수</th>
              <th>단가</th>
              <th>거래일</th>
              {type === "BUY" && <th>환매</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.fundTransactionId || tx.fundAccountId}>
                <td>{tx.fund_name || tx.fundAccountName}</td>
                <td>{tx.fundInvestAmount?.toLocaleString() || tx.fundBalance?.toLocaleString()}</td>
                <td>{tx.fundUnitsPurchased || "-"}</td>
                <td>{tx.fundPricePerUnit || "-"}</td>
                <td>{formatDate(tx.fundTransactionDate || tx.closeDate)}</td> {/* 날짜 포맷팅 */}
                {type === "BUY" && (
                  <td>
                    {tx.status === "APPROVED" ? (
                      <button className={styles.sellButton} onClick={() => onSellRequest(tx)}>환매하기</button>
                    ) : tx.status === "PENDING" ? (
                      <span className={styles.pendingLabel}>승인 대기중</span>
                    ) : null}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyFund;