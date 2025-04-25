import React, { useState } from "react";
import "../../Css/loan/LoanCalculator.css";

const LoanCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [year, setYear] = useState("");
  const [repaymentMethod, setRepaymentMethod] = useState("원리금 균등상환");
  const [repaymentSchedule, setRepaymentSchedule] = useState([]);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  const formatNumber = (value) => {
    const numeric = value.replace(/,/g, "");
    return !isNaN(numeric) && numeric !== ""
      ? parseFloat(numeric).toLocaleString("ko-KR")
      : "";
  };

  const calculateRepayment = () => {
    const p = parseFloat(principal.replace(/,/g, ""));
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(year) * 12;

    if (!p || !r || !n) {
      alert("모든 값을 올바르게 입력해주세요.");
      return;
    }

    let total = 0;
    let interestTotal = 0;
    let result = [];

    if (repaymentMethod === "원리금 균등상환") {
      const monthly = Math.round(
        (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      );
      let remaining = p;

      for (let i = 1; i <= n; i++) {
        const interestPart = Math.round(remaining * r);
        const principalPart = monthly - interestPart;

        result.push({
          month: i,
          total: monthly,
          principal: principalPart,
          interest: interestPart,
        });

        remaining -= principalPart;
        total += monthly;
        interestTotal += interestPart;
      }
    } else if (repaymentMethod === "원금 균등상환") {
      const principalPart = Math.round(p / n);
      let remaining = p;

      for (let i = 1; i <= n; i++) {
        const interestPart = Math.round(remaining * r);
        const monthly = principalPart + interestPart;

        result.push({
          month: i,
          total: monthly,
          principal: principalPart,
          interest: interestPart,
        });

        remaining -= principalPart;
        total += monthly;
        interestTotal += interestPart;
      }
    } else if (repaymentMethod === "만기 일시상환") {
      const monthlyInterest = Math.round(p * r);

      for (let i = 1; i < n; i++) {
        result.push({
          month: i,
          total: monthlyInterest,
          principal: 0,
          interest: monthlyInterest,
        });

        total += monthlyInterest;
        interestTotal += monthlyInterest;
      }

      result.push({
        month: n,
        total: p + monthlyInterest,
        principal: p,
        interest: monthlyInterest,
      });

      total += p + monthlyInterest;
      interestTotal += monthlyInterest;
    }

    setRepaymentSchedule(result);
    setTotalPayment(total);
    setTotalInterest(interestTotal);
  };

  return (
    <div className="loanCalc-container">
      <h2 className="loanCalc-title">📊 대출 상환 계산기</h2>

      <div className="loanCalc-inputs">
        <label>
          대출 금액(원)
          <input
            type="text"
            value={principal}
            onChange={(e) => setPrincipal(formatNumber(e.target.value))}
          />
        </label>
        <label>
          연 이자율(%)
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </label>
        <label>
          상환 기간(년)
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </label>
        <label>
          상환 방식
          <select
            value={repaymentMethod}
            onChange={(e) => setRepaymentMethod(e.target.value)}
          >
            <option value="원리금 균등상환">원리금 균등상환</option>
            <option value="원금 균등상환">원금 균등상환</option>
            <option value="만기 일시상환">만기 일시상환</option>
          </select>
        </label>
        <button onClick={calculateRepayment}>📌 계산하기</button>
      </div>

      <div className="loanCalc-results">
        <h3>상환 방식: {repaymentMethod}</h3>
        <h4>월별 납입 내역</h4>
        <ul>
          {repaymentSchedule.map(({ month, total, principal, interest }) => (
            <li key={month}>
              {month}회차 → 총 {total.toLocaleString()}원 (원금:{" "}
              {principal.toLocaleString()}원, 이자: {interest.toLocaleString()}
              원)
            </li>
          ))}
        </ul>
        <p>💰 총 납입 금액: {totalPayment.toLocaleString()} 원</p>
        <p>💸 총 이자 금액: {totalInterest.toLocaleString()} 원</p>
      </div>
    </div>
  );
};

export default LoanCalculator;
