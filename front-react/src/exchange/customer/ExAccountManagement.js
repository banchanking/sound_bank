import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import { getCustomerID } from "../../jwt/AxiosToken";
import styles from "../../Css/exchange/ExAccountManage.module.css";
// import styles from '../../Css/exchange/ExList.module.css';

const ExAccountManagement = () => {
  const [wallets, setWallets] = useState([]);
  const customer_id = getCustomerID();

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await RefreshToken.get(
          `http://localhost:8081/api/exchange/walletList/${customer_id}`
        );
        setWallets(response.data);
      } catch (error) {
        console.error("지갑 조회 실패", error);
      }
    };

    fetchWallet();
  }, [customer_id]);

  const handleDeactivate = async (wallet) => {
    if(window.confirm("정말로 지갑을 해지하시겠습니까?")){
      if (wallet.balance > 0) {
        alert("지갑에 잔액이 있습니다. 해지할 수 없습니다.");
        return;
      }
  
      try {
        const response = await RefreshToken.put(
          `http://localhost:8081/api/exchange/deactivateWallet/${wallet.wallet_id}`
        );
        
        alert("지갑 해지 신청이 완료되었습니다.");
        
        // 해지 후 목록 다시 조회
        setWallets((prev) =>
          prev.map((w) =>
            w.wallet_id === wallet.wallet_id
              ? { ...w, status: "DEACTIVATE" }
              : w
          )
        );
      } catch (error) {
        console.error("지갑 해지 실패", error);
        alert("지갑 해지 중 오류가 발생했습니다.");
      }
    }
    
  };

  return (
    <div className={styles.container}>
  <h2 className={styles.title}>보유 외화 지갑 목록</h2>
  {wallets.length === 0 ? (
    <p>지갑이 없습니다.</p>
  ) : (
    <ul className={styles.walletList}>
      {wallets.map((wallet) => (
        <li key={wallet.wallet_id} className={styles.walletItem}>
          <p>통화: {wallet.currency_code}</p>
          {wallet.balance !== null && <p>잔액: {wallet.balance} {wallet.currency_code}</p>}
          {wallet.status && <p>상태: {wallet.status}</p>}
          {wallet.status === "ACTIVE" && (
            <button
              className={styles.deactivateButton}
              onClick={() => handleDeactivate(wallet)}
            >
              해지 신청
            </button>
          )}
        </li>
      ))}
    </ul>
  )}
</div>
  );
};

export default ExAccountManagement;
