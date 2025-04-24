import React from "react";
import styles from "../../Css/fund/MyFund.module.css";

const MyFund = ({ type, onClose, transactions, closedAccounts, onSellRequest }) => {
  const titleMap = {
    BUY: "펀드 매수 내역",
    SELL: "펀드 환매 내역",
    CLOSED: "해지된 펀드 계좌",
  };

  const filtered = type === "BUY"
    ? transactions.filter(tx => tx.fundTransactionType === "BUY")
    : type === "SELL"
    ? transactions.filter(tx => tx.fundTransactionType === "SELL" && tx.status === "APPROVED")
    : closedAccounts;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>{titleMap[type]}</h3>
        <button onClick={onClose} className={styles.modalClose}>닫기</button>
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
                <td>{tx.fundTransactionDate || tx.closeDate || "-"}</td>
                {type === "BUY" && (
                  <td>
                    {tx.status === "APPROVED" ? (
                      <button onClick={() => onSellRequest(tx)}>환매하기</button>
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