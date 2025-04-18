import React, { useState } from "react";
import Draggable from "react-draggable";

const DepositCalculator = ({ onClose }) => {
  const [principal, setPrincipal] = useState(""); // 원금
  const [rate, setRate] = useState(""); // 이자율
  const [time, setTime] = useState(""); // 기간
  const [total, setTotal] = useState(null); // 계산 결과

  const calculateTotal = (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지

    // 입력값 검증
    if (!principal || !rate || !time) {
      alert("모든 값을 입력해주세요.");
      return;
    }

    const principalAmount = parseFloat(principal);
    const interestRate = parseFloat(rate) / 100;
    const timePeriod = parseFloat(time);

    if (isNaN(principalAmount) || isNaN(interestRate) || isNaN(timePeriod)) {
      alert("유효한 숫자를 입력해주세요.");
      return;
    }

    // 계산 로직
    const totalAmount = principalAmount + principalAmount * interestRate * timePeriod;
    setTotal(totalAmount); // 결과 업데이트
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  return (
    <Draggable handle=".modal-header">
      <div className="draggable-modal">
        <div className="modal-header">
          <h2>예금 계산기</h2>
          <button className="modal-close-button" onClick={onClose}>
            닫기
          </button>
        </div>
        <form>
          <div>
            <label>원금 : </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="원금을 입력하세요"
            />
          </div>
          <div>
            <label>이자율 (%) : </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="이자율을 입력하세요"
            />
          </div>
          <div>
            <label>기간 (년) : </label>
            <input
              type="number"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="기간을 입력하세요"
            />
          </div>
          <button type="button" onClick={calculateTotal}>
            계산
          </button>
        </form>
        {total !== null && (
          <div>
            <h3>총액: {formatCurrency(total)} 원</h3>
          </div>
        )}
      </div>
    </Draggable>
  );
};

export default DepositCalculator;