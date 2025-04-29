import React from "react";
import styles from "../../Css/fund/MyFund.module.css";

const MyFund = ({ type, onClose, transactions, closedAccounts, onSellRequest }) => {
  const titleMap = {
    BUY: "펀드 매수 내역",
    SELL: "펀드 환매 내역",
    CLOSED: "해지된 펀드 계좌",
  };

  // 📌 type에 따라 매수/환매/해지 분기 처리
  const filtered = type === "BUY"
  ? transactions.filter(
      (tx) =>
        tx.fundTransactionType === "BUY" &&
        (tx.status === "APPROVED" || tx.status === "PENDING") // 환매 완료된 상품 제외
    )
  : type === "SELL"
  ? transactions.filter(tx => tx.fundTransactionType === "SELL" && tx.status === "APPROVED")
  : closedAccounts;

  return (
    <div className={styles.fundmodalOverlay}>
      <div className={styles.fundmodalContent}>
        <h3>{titleMap[type]}</h3>
        <button onClick={onClose} className={styles.fundmodalClose}>닫기</button>

        <table className={styles.fundTable}>
          <thead>
            <tr>
              <th>펀드명</th>
              <th>투자금액</th>
              <th>좌수</th>
              <th>단가</th>
              <th>거래일</th>
              {type === "BUY" && <th>환매</th>}
              {type === "CLOSED" && <th>해지 신청</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((tx) => (
              <tr key={tx.fundTransactionId || tx.fundAccountId}>
                <td>{tx.fund_name || tx.fundAccountName}</td>
                <td>{tx.fundInvestAmount?.toLocaleString() || tx.fundBalance?.toLocaleString()}</td>
                <td>{tx.fundUnitsPurchased || "-"}</td>
                <td>{tx.fundPricePerUnit || "-"}</td>
                <td>
                  {/* 📌 거래일 처리: 매수/환매는 fundTransactionDate, 해지는 closeDate */}
                  {type === "CLOSED"
                    ? (Array.isArray(tx.closeDate) && tx.closeDate.length >= 3
                        ? `${tx.closeDate[0]}/${String(tx.closeDate[1]).padStart(2, '0')}/${String(tx.closeDate[2]).padStart(2, '0')}`
                        : "0000/00/00")
                    : (Array.isArray(tx.fundTransactionDate) && tx.fundTransactionDate.length === 3
                        ? `${tx.fundTransactionDate[0]}/${String(tx.fundTransactionDate[1]).padStart(2, '0')}/${String(tx.fundTransactionDate[2]).padStart(2, '0')}`
                        : "0000/00/00")
                  }

                </td>

                {/* 📌 BUY 타입일 때 (매수 내역 표시 + 환매버튼) */}
                {type === "BUY" && (
                  <td>
                    {tx.status === "APPROVED" ? (
                      <button onClick={() => onSellRequest(tx)}>환매하기</button>
                    ) : tx.status === "PENDING" ? (
                      <span className={styles.pendingLabel}>승인 대기중</span>
                    ) : null}
                  </td>
                )}

                {/* 📌 CLOSED 타입일 때 (해지 신청 흐름) */}
                {type === "CLOSED" && (
                  <td>
                    {tx.status === "REJECTED" ? (
                      <>
                        <div style={{ color: "red", fontWeight: "bold", fontSize: "0.9rem", marginBottom: "5px" }}>
                          해지 거절되었습니다 (사유: 펀드계좌에 좌수가 남아 있습니다. 잔여 좌수 소진 후 해지 재신청 가능)
                        </div>
                        {/* 거절되었으면 다시 해지 신청 버튼 활성화 가능 (필요에 따라 추가) */}
                        <button onClick={() => onSellRequest(tx)} className={styles.fundCloseButton}>
                          해지 재신청
                        </button>
                      </>
                    ) : tx.status === "DEACTIVE" ? (
                      <span className={styles.pendingLabel}>승인 대기중</span>
                    ) : tx.status === "CLOSED" ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>해지 완료</span>
                    ) : (
                      <button onClick={() => onSellRequest(tx)} className={styles.fundCloseButton}>
                        해지 신청
                      </button>
                    )}
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
