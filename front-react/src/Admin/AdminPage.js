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
import FundProductManage from "../fund/admin/FundProductManage";
import FundTestManage from "../fund/admin/FundTestManage";
import FindFundCustomer from "../fund/admin/FindFundCustomer";
import OpenApplyList from "../fund/admin/OpenApplyList";
import CloseApplyList from "../fund/admin/CloseApplyList";
import CustomerTransHistory from "../fund/admin/CustomerTransHistory";
import AdminExchangeRateManage from "../exchange/admin/AdminExchangeRateManage";
import AdminWalletList from "../exchange/admin/AdminWalletList";
import AdminExRequestList from "../exchange/admin/AdminExRequestList";
import DepositProduct from "../deposit/admin/DepositProduct";
import SavingsProduct from "../deposit/admin/SavingsProduct";
import MultiAdmin from "../transfer/admin/MultiAdmin";
import LimitAdmin from "../transfer/admin/LimitAdmin";

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
        { name: "예금상품관리", component: "DepositProduct" },
        { name: "적금상품관리", component: "SavingsProduct" },
      ],
    },
    {
      title: "조회/이체",
      icon: <FaExchangeAlt />,
      items: [
        { name: "다건이체 승인", component: "MultiAdmin" },
        { name: "이체한도 심사", component: "LimitAdmin" },
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
        { name: "환율/수수료 조정", component: "AdminExchangeRateManage" },
        { name: "회원 지갑 목록", component: "AdminWalletList" },
        { name: "환전 승인/거부", component: "AdminExRequestList" },
      ],
    },
    {
      title: "펀드",
      icon: <FaChartLine />,
      items: [
        { name: "펀드상품관리", component: "FundProductManage" },
        { name: "투자성향분석 테스트관리", component: "FundTestManage" },
        { name: "고객펀드조회", component: "FindFundCustomer" },
        { name: "계좌개선신청목록", component: "OpenApplyList" },
        { name: "계좌해지신청목록", component: "CloseApplyList" },
        { name: "회원거래내역조회", component: "CustomerTransHistory" },
      ],
    },
  ];

  const renderComponent = () => {
    switch (selectedComponent) {
      // 예금 컴포넌트 호출 시작
      case "DepositProduct":
        return <DepositProduct />;
      case "SavingsProduct":
        return <SavingsProduct />;
      // 예금 컴포넌트 호출 종료
      // 조회 컴포넌트 호출 시작
      case "MultiAdmin":
        return <MultiAdmin />;
      case "LimitAdmin":
        return <LimitAdmin />;
      // 조회 컴포넌트 호출 종료
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

      // 펀드 컴포넌트 호출 시작
      case "FundProductManage":
        return <FundProductManage />;
      case "FundTestManage":
        return <FundTestManage />;
      case "FindFundCustomer":
        return <FindFundCustomer />;
      case "OpenApplyList":
        return <OpenApplyList />;
      case "CloseApplyList":
        return <CloseApplyList />;
      case "CustomerTransHistory":
        return <CustomerTransHistory />;
      // 펀드 컴포넌트 호출 종료

      // 외환 컴포넌트 호출 시작
      case "AdminExchangeRateManage":
        return <AdminExchangeRateManage />;
      case "AdminWalletList":
        return <AdminWalletList />;
      case "AdminExRequestList":
        return <AdminExRequestList />;
      // 외환 컴포넌트 호출 종료
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
