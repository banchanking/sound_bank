import React from "react";
import styles from "../../Css/fund/MyFund.module.css";

const MyFund = ({ type, onClose, transactions, closedAccounts, onSellRequest }) => {
  const titleMap = {
    BUY: "펀드 매수 내역",
    SELL: "펀드 환매 내역",
    CLOSED: "해지된 펀드 계좌",
  };

  // 거래유형(type)에 따라 목록 필터링
  const filtered = type === "BUY"
    ? transactions.filter((tx) => {
        if (
          tx.fundTransactionType !== "BUY" ||
          tx.status !== "APPROVED"
        ) {
          return false;
        }

        // 관련된 SELL 거래 목록
        const relatedSells = transactions.filter(
          (other) =>
            other.fundTransactionType === "SELL" &&
            other.fundAccountId === tx.fundAccountId &&
            other.fundId === tx.fundId
        );

        // 승인된 환매가 있으면 제외
        if (relatedSells.some((s) => s.status === "APPROVED")) {
          return false;
        }

        // 거절된 환매가 3회 이상이면 제외
        const rejectCount = relatedSells.filter((s) => s.status === "REJECTED").length;
        if (rejectCount >= 3) {
          return false;
        }

        return true;
      })
    : type === "SELL"
    ? transactions.filter(
        (tx) =>
          tx.fundTransactionType === "SELL" &&
          (tx.status === "APPROVED" || tx.status === "REJECTED")
      )
    : closedAccounts.filter(
        (tx) => tx.status === "CLOSED" || tx.status === "REJECTED"
      );

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
              {type === "SELL" && <th>상태</th>}
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
                  {type === "CLOSED"
                    ? (Array.isArray(tx.closeDate) && tx.closeDate.length >= 3
                        ? `${tx.closeDate[0]}/${String(tx.closeDate[1]).padStart(2, '0')}/${String(tx.closeDate[2]).padStart(2, '0')}`
                        : "0000/00/00")
                    : (Array.isArray(tx.fundTransactionDate) && tx.fundTransactionDate.length === 3
                        ? `${tx.fundTransactionDate[0]}/${String(tx.fundTransactionDate[1]).padStart(2, '0')}/${String(tx.fundTransactionDate[2]).padStart(2, '0')}`
                        : "0000/00/00")
                  }
                </td>

                {/* BUY 탭: 환매 상태에 따라 버튼 분기 */}
                {type === "BUY" && (
                  <td>
                    {
                      (() => {
                        // 해당 BUY에 대응하는 SELL 거래 목록 추출
                        const relatedSells = transactions.filter(
                          (other) =>
                            other.fundTransactionType === "SELL" &&
                            other.fundAccountId === tx.fundAccountId &&
                            other.fundId === tx.fundId
                        );

                        const sellTx = relatedSells[relatedSells.length - 1]; // 가장 최근 거래
                        const rejectCount = relatedSells.filter(s => s.status === "REJECTED").length;

                        // 환매 신청 중이면 승인 대기중 텍스트 표시
                        if (sellTx?.status === "PENDING") {
                          return <span className={styles.pendingLabel}>승인 대기중</span>;
                        }

                        // 환매 거절이고 거절횟수 3회 미만 → 재신청 가능
                        if (sellTx?.status === "REJECTED" && rejectCount < 3) {
                          return (
                            <button 
                              onClick={() => onSellRequest(tx)}
                              style={{
                                backgroundColor: "#ab4f4f",
                                color: "#fff",
                                fontWeight: "bold",
                                border: "none",
                                borderRadius: "8px",
                                padding: "7px 10px",
                                cursor: "pointer"
                              }}
                            >
                              재신청하기
                            </button>
                          );
                        }

                        // 거절 3회 이상이면 환매 불가 → 거절됨 텍스트 표시
                        if (sellTx?.status === "REJECTED" && rejectCount >= 3) {
                          return <span style={{ color: "red", fontWeight: "bold" }}>거절됨</span>;
                        }

                        // 환매 기록이 없으면 환매하기 버튼
                        return <button onClick={() => onSellRequest(tx)}>환매하기</button>;
                      })()
                    }
                  </td>
                )}

                {/* SELL 탭: 상태 표시 (승인/거절) */}
                {type === "SELL" && (
                  <td>
                    {tx.status === "APPROVED" ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>승인 완료</span>
                    ) : tx.status === "REJECTED" ? (
                      <span style={{ color: "red", fontWeight: "bold" }}>거절됨</span>
                    ) : null}
                  </td>
                )}

                {/* CLOSED 탭: 해지 상태 및 버튼 처리 */}
                {type === "CLOSED" && (
                  <td>
                    {tx.status === "REJECTED" ? (
                      <>
                        <div style={{ color: "red", fontWeight: "bold", fontSize: "0.9rem", marginBottom: "5px" }}>
                          해지 거절되었습니다 (사유: 펀드계좌에 좌수가 남아 있습니다. 잔여 좌수 소진 후 해지 재신청 가능)
                        </div>
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
