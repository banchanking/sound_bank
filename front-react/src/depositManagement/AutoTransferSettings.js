import React, { useState } from "react";
import "../Css/Deposit/AutoTransferSettings.css"; // CSS 파일 import

const AutoTransferSettings = () => {
  const [transferType, setTransferType] = useState("정기"); // 이체 유형 상태
  const [transferAmount, setTransferAmount] = useState(""); // 이체 금액 상태
  const [transferDate, setTransferDate] = useState(""); // 이체 날짜 상태
  const [accountNumber, setAccountNumber] = useState(""); // 계좌번호 상태

  const handleSaveSettings = () => {
    console.log("이체 유형:", transferType);
    console.log("이체 금액:", transferAmount);
    console.log("이체 날짜:", transferDate);
    console.log("계좌번호:", accountNumber);
    alert("자동이체 설정이 저장되었습니다.");
  };

  return (
    <div className="auto-transfer-container">
      <h1 className="auto-transfer-title">자동이체 설정</h1>

      {/* 이체 유형 */}
      <div className="form-group">
        <label>이체 유형:</label>
        <select
          value={transferType}
          onChange={(e) => setTransferType(e.target.value)}
          className="form-control"
        >
          <option value="정기">정기</option>
          <option value="일회성">일회성</option>
        </select>
      </div>

      {/* 이체 금액 */}
      <div className="form-group">
        <label>이체 금액:</label>
        <input
          type="number"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          placeholder="금액을 입력하세요"
          className="form-control"
        />
      </div>

      {/* 이체 날짜 */}
      <div className="form-group">
        <label>이체 날짜:</label>
        <input
          type="date"
          value={transferDate}
          onChange={(e) => setTransferDate(e.target.value)}
          className="form-control"
        />
      </div>

      {/* 계좌번호 */}
      <div className="form-group">
        <label>계좌번호:</label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="계좌번호를 입력하세요"
          className="form-control"
        />
      </div>

      {/* 저장 버튼 */}
      <div className="form-group">
        <button onClick={handleSaveSettings} className="save-button">
          설정 저장
        </button>
      </div>
    </div>
  );
};

export default AutoTransferSettings;