import React, { useState } from "react";
import styles from "../../Css/exchange/ExchangeAdminPage.module.css";
import AdminExAccountRequestList from "./AdminExAccountRequestList";
import AdminExchangeRateManage from "./AdminExchangeRateManage";
import AdminWalletList from "./AdminWalletList";
import AdminWalletStatus from "./AdminWalletStatus";

const ExchangeAdminPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("rate");

  const renderContent = () => {
    switch (selectedMenu) {
      case "rate":
        return <AdminExchangeRateManage />;
      case "walletList":
        return <AdminWalletList />;
      case "walletStatus":
        return <AdminWalletStatus />;
      case "exchangeApproval":
        return <AdminExAccountRequestList />;
      default:
        return <div>메뉴를 선택하세요.</div>;
    }
  };

  return (
    <div className={styles.adminContainer}>
      {/* 왼쪽 메뉴 */}
      <div className={styles.leftMenu}>
        <h3>관리자 메뉴</h3>
        <ul className={styles.menuList}>
          <li><button onClick={() => setSelectedMenu("rate")}>환율/수수료 조정</button></li>
          <li><button onClick={() => setSelectedMenu("walletList")}>회원 지갑 목록</button></li>
          <li><button onClick={() => setSelectedMenu("walletStatus")}>지갑 상태 변경</button></li>
          <li><button onClick={() => setSelectedMenu("exchangeApproval")}>환전 승인/거부</button></li>
        </ul>
      </div>

      {/* 메인 컨텐츠 */}
      <div className={styles.mainContent}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ExchangeAdminPage;
