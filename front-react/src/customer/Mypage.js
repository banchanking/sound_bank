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
import MyInfo from "./MyInfo";
import MyInterest from "../sound_loan/customer/MyInterest";
import MyLoanStatus from "../sound_loan/customer/MyLoanStatus";
import MyLateInterest from "../sound_loan/customer/MyLateInterest";
import "../Css/mypage/MyPageLayout.css";
import LoanCalculator from "../sound_loan/customer/LoanCalculator";
import MyFundInfo from "../fund/customer/MyFundInfo";
import OpenAccount from "../fund/customer/OpenAccount";
import CloseAccount from "../fund/customer/CloseAccount";
import TransHistory from "../fund/customer/TransHistory";
import ExchangeWalletStatus from "../exchange/customer/ExchangeWalletStatus";
import ExList from "../exchange/customer/ExList";
import ExAccountManagement from "../exchange/customer/ExAccountManagement";
import InquireAccont from "../inquire/InquireAccont";
import InquireTransfer from "../inquire/InquireTransfer";
import DepositAccountInquiry from "../deposit/customer/DepositAccountInquiry";
import DepositTransactionDetails from "../deposit/customer/DepositTransactionDetails";
import DepositAutoManagement from "../deposit/customer/DepositAutoManagement";
import MyInfoEdit from "./MyInfoEdit";
import DeleteCustomer from "./DeleteCustomer";

const Mypage = () => {
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState("MyInfo");
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshInterest = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const menuData = [
    {
      title: "마이페이지",
      icon: <FaUser />,
      items: [
        { name: "내정보조회", component: "MyInfo" },
        { name: "회원탈퇴", component: "DeleteCustomer" },
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
        { name: "대출현황 및 중도상환처리", component: "MyLoanStatus" },
        { name: "이자납입내역", component: "MyInterest" },
        { name: "연체내역", component: "MyLateInterest" },
        { name: "대출계산기", component: "LoanCalculator" },
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
      // 마이페이지 컴포넌트 호출 시작
      case "MyInfo":
        return <MyInfo onEdit={() => setSelectedComponent("MyInfoEdit")} />;
      case "MyInfoEdit":
        return <MyInfoEdit onCancel={() => setSelectedComponent("MyInfo")} />;
      case "DeleteCustomer":
        return <DeleteCustomer />;
      // 마이페이지 컴포넌트 호출 종료
      // 예/적금 컴포넌트 호출 시작
      case "DepositAccountInquiry":
        return <DepositAccountInquiry />;
      case "DepositTransactionDetails":
        return <DepositTransactionDetails />;
      case "DepositAutoManagement":
        return <DepositAutoManagement />;
      // 예/적금 컴포넌트 호출 종료
      // 조회/이체 컴포넌트 호출 시작
      case "InquireAccont":
        return <InquireAccont />;
      case "InquireTransfer":
        return <InquireTransfer />;
      // 조회/이체 컴포넌트 호출 종료
      // 대출 컴포넌트 호출 시작
      case "MyLoanStatus":
        return <MyLoanStatus key={refreshKey} onRefresh={refreshInterest} />;
      case "MyInterest":
        return <MyInterest key={refreshKey} onRefresh={refreshInterest} />;
      case "MyLateInterest":
        return <MyLateInterest key={refreshKey} onRefresh={refreshInterest} />;
      case "LoanCalculator":
        return <LoanCalculator />;
      // 대출 컴포넌트 호출 종료
      // 외환 컴포넌트 호출 시작
      case "ExchangeWalletStatus":
        return <ExchangeWalletStatus />;
      case "ExList":
        return <ExList />;
      case "ExAccountManagement":
        return <ExAccountManagement />;
      // 외환 컴포넌트 호출 종료
      // 펀드 컴포넌트 호출 시작
      case "MyFundInfo":
        return <MyFundInfo />;
      case "OpenAccount":
        return <OpenAccount />;
      case "CloseAccount":
        return <CloseAccount />;
      case "TransHistory":
        return <TransHistory />;
      // 펀드 컴포넌트 호출 종료
      default:
        return <div className="mypage-placeholder">메뉴를 선택해주세요.</div>;
    }
  };

  return (
    <div className="mypage-container">
      <aside className="mypage-sidebar">
        {menuData.map((menu, idx) => (
          <div key={idx} className="mypage-menuGroup">
            <div
              className="mypage-menuTitle"
              onClick={() =>
                setActiveMenuIndex(activeMenuIndex === idx ? null : idx)
              }
            >
              <span className="mypage-menuIcon">{menu.icon}</span>
              <span>{menu.title}</span>
              {activeMenuIndex === idx ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {activeMenuIndex === idx && (
              <div className="mypage-subMenu">
                {menu.items.map((item, subIdx) => (
                  <div
                    key={subIdx}
                    className={`mypage-subItem ${
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

      <main className="mypage-content">{renderComponent()}</main>
    </div>
  );
};

export default Mypage;
