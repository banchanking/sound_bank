import React, { useState } from "react";
import {
  FaUser,
  FaPiggyBank,
  FaExchangeAlt,
  FaMoneyCheckAlt,
  FaGlobe,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "../Css/admin/AdminPage.css";
import LoanInsertForm from "../sound_loan/admin/LoanInsertForm";
import LoanList from "../sound_loan/admin/LoanList";
import LoanInterestList from "../sound_loan/admin/LoanInterestList";
import LoanLateInterestList from "../sound_loan/admin/LoanLateInterestList";
import LoanCustomerList from "../sound_loan/admin/LoanCustomerList";

const AdminPage = () => {
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState("null");
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshInterest = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const menuData = [
    {
      title: "관리자 페이지",
      icon: <FaUser />,
      items: [
        { name: "관리자목록", component: "FundInfo" },
        { name: "회원탈퇴", component: "FundInfo" },
      ],
    },
    {
      title: "예/적금",
      icon: <FaPiggyBank />,
      items: [
        { name: "계좌조회", component: "DepositAccountInquiry" },
        { name: "거래내역", component: "DepositTransactionDetails" },
        { name: "자동이체관리", component: "DepositAutoManagement" },
      ],
    },
    {
      title: "조회/이체",
      icon: <FaExchangeAlt />,
      items: [
        { name: "보유계좌", component: "InquireAccont" },
        { name: "거래내역", component: "InquireTransfer" },
      ],
    },
    {
      title: "대출",
      icon: <FaMoneyCheckAlt />,
      items: [
        { name: "대출상품목록", component: "LoanList" },
        { name: "대출상품등록", component: "LoanInsertForm" },
        { name: "대출진행상황", component: "LoanCustomerList" },
        { name: "대출이자납입내역", component: "LoanInterestList" },
        { name: "연체이력고객목록", component: "LoanLateInterestList" },
      ],
    },
    {
      title: "외환",
      icon: <FaGlobe />,
      items: [
        { name: "My 지갑", component: "ExchangeWalletStatus" },
        { name: "환전내역 조회", component: "ExList" },
        { name: "외환 지갑 해지", component: "ExAccountManagement" },
      ],
    },
    {
      title: "펀드",
      icon: <FaChartLine />,
      items: [
        { name: "펀드정보조회", component: "MyFundInfo" },
        { name: "펀드계좌개설", component: "OpenAccount" },
        { name: "펀드계좌해지", component: "CloseAccount" },
        { name: "펀드거래내역", component: "TransHistory" },
      ],
    },
  ];

  const renderComponent = () => {
    switch (selectedComponent) {
      // 대출 컴포넌트 호출 시작
      case "LoanInsertForm":
        return <LoanInsertForm />;
      case "LoanList":
        return <LoanList />;
      case "LoanInterestList":
        return <LoanInterestList />;
      case "LoanCustomerList":
        return <LoanCustomerList />;
      case "LoanLateInterestList":
        return <LoanLateInterestList />;
      // 대출 컴포넌트 호출 종료
      default:
        return (
          <div className="adminPage-placeholder">메뉴를 선택해주세요.</div>
        );
    }
  };
  return (
    <div className="adminPage-container">
      <aside className="adminPage-sidebar">
        {menuData.map((menu, idx) => (
          <div key={idx} className="adminPage-menuGroup">
            <div
              className="adminPage-menuTitle"
              onClick={() =>
                setActiveMenuIndex(activeMenuIndex === idx ? null : idx)
              }
            >
              <span className="adminPage-menuIcon">{menu.icon}</span>
              <span>{menu.title}</span>
              {activeMenuIndex === idx ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {activeMenuIndex === idx && (
              <div className="adminPage-subMenu">
                {menu.items.map((item, subIdx) => (
                  <div
                    key={subIdx}
                    className={`adminPage-subItem ${
                      selectedComponent === item.component ? "active" : ""
                    }`}
                    onClick={() => setSelectedComponent(item.component)}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>

      <main className="adminPage-content">{renderComponent()}</main>
    </div>
  );
};

export default AdminPage;
