import React, { useState } from "react";
import "../Css/Deposit/DepositTermination.css"; // CSS 파일 import

const DepositTermination = () => {
  const [selectedAccount, setSelectedAccount] = useState(""); // 보유 계좌 상태
  const [terminationYear, setTerminationYear] = useState(""); // 해지 예상 연도
  const [terminationMonth, setTerminationMonth] = useState(""); // 해지 예상 월
  const [terminationDay, setTerminationDay] = useState(""); // 해지 예상 일

  const accountList = ["123-456-789", "987-654-321", "456-789-123"]; // 보유 계좌 목록
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i); // 현재 연도부터 10년
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1월부터 12월
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // 1일부터 31일까지

  const basicInfo = {
    예금주명: "홍길동",
    계좌번호: "123-456-789",
    해지구분: "만기해지",
    해지예정일: "2025-12-31",
    상품종류: "정기예금",
    신규일: "2023-01-01",
    만기일: "2025-12-31",
    총납입회차: "24회",
  };

  const detailedInfo = {
    원금: "10,000,000원",
    세금합계: "200,000원",
    세전이자액: "500,000원",
    소득세_법인세: "150,000원",
    세후이자액: "350,000원",
    지방소득세: "15,000원",
    만기_중도해지이자: "500,000원",
    농특세: "10,000원",
    특별이자: "50,000원",
    기지급이자액: "100,000원",
    만기후이자: "20,000원",
    기납입세액: "30,000원",
    찾으실수있는금액: "10,770,000원",
  };

  const handleCalendarClick = () => {
    alert("달력 버튼 클릭됨!"); // 달력 버튼 클릭 시 동작
  };

  return (
    <div className="deposit-termination-container">
      <h1 className="deposit-termination-title">예금 해지 신청</h1>

      {/* NOTICE */}
      <div className="notice-section">
        <h2>NOTICE</h2>
        <p>
          찾으실 수 있는 금액 = 원금 + (이자합계 - 환입이자액) - (세금합계 - 기납액세액)
        </p>
      </div>
      {/* 보유 계좌 목록 */}
      <div className="form-group">
        <label>보유 계좌 목록:</label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="form-control"
        >
          <option value="">계좌를 선택하세요</option>
          {accountList.map((account, index) => (
            <option key={index} value={account}>
              {account}
            </option>
          ))}
        </select>
      </div>

      {/* 해지 예상 일자 */}
      <div className="form-group">
        <label>해지 예상 일자:</label>
        <div className="date-dropdowns">
          <select
            value={terminationYear}
            onChange={(e) => setTerminationYear(e.target.value)}
            className="form-control"
          >
            <option value="">년</option>
            {years.map((year, index) => (
              <option key={index} value={year}>
                {year}년
              </option>
            ))}
          </select>
          <select
            value={terminationMonth}
            onChange={(e) => setTerminationMonth(e.target.value)}
            className="form-control"
          >
            <option value="">월</option>
            {months.map((month, index) => (
              <option key={index} value={month}>
                {month}월
              </option>
            ))}
          </select>
          <select
            value={terminationDay}
            onChange={(e) => setTerminationDay(e.target.value)}
            className="form-control"
          >
            <option value="">일</option>
            {days.map((day, index) => (
              <option key={index} value={day}>
                {day}일
              </option>
            ))}
          </select>
          <button onClick={handleCalendarClick} className="calendar-button">
            달력
          </button>
        </div>
      </div>

      {/* 확인 버튼 */}
      <div className="form-group">
        <button className="confirm-button">확인</button>
      </div>

      {/* 기본정보 섹션 */}
      <div className="info-section">
        <h2>기본정보</h2>
        <table className="info-table">
          <tbody>
            {Object.entries(basicInfo).map(([key, value], index) => (
              <tr key={index}>
                <td className="info-label">{key}</td>
                <td className="info-value">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세정보 섹션 */}
      <div className="info-section">
        <h2>상세정보</h2>
        <table className="info-table">
          <tbody>
            {Object.entries(detailedInfo).map(([key, value], index) => (
              <tr key={index}>
                <td className="info-label">{key}</td>
                <td className="info-value">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepositTermination;