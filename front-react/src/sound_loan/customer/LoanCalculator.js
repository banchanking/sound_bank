import React, { useState } from "react";
import "../../Css/loan/LoanService.css";

const LoanCalculator = () => {
  const [principal, setPrincipal] = useState(""); //  대출 원금
  const [rate, setRate] = useState(0); //  연이율
  const [year, setYear] = useState(0); //    대출 기간 (년)
  const [interest, setInterest] = useState([]); //  월 납입금
  const [repaymentMethod, setRepaymentMethod] = useState("원리금 균등상환"); // 상환방식
  const [totalPayment, setTotalPayment] = useState(0); // 총 납입 금액
  const [totalInterest, setTotalInterest] = useState(0); // 총 납입 이자

  // 숫자 입력시 단위수 (,) 표현  & 문자열 입력시 삭제
  const formatNumber = (value) => {
    const numericValue = value.replace(/,/g, "");
    if (!isNaN(numericValue) && numericValue !== "") {
      return parseFloat(numericValue).toLocaleString("ko-KR");
    }
    return "";
  };

  const InterestCalculator = () => {
    const p = parseFloat(principal.replace(/,/g, ""));
    const r = parseFloat(rate) / 100 / 12; // 월 이자율
    const n = parseFloat(year) * 12; // 납입 횟수

    if (!p || !r || !n) {
      alert("올바른 값을 입력하세요.");
      return;
    }

    let monthlyPaymentsArray = [];
    let totalPaid = 0;
    let totalInterestPaid = 0;

    if (repaymentMethod === "원리금 균등상환") {
      const factor = Math.pow(1 + r, n);
      const monthlyPayment = Math.round((p * r * factor) / (factor - 1));

      let remainingPrincipal = p;

      for (let i = 0; i < n; i++) {
        const interestPayment = Math.round(remainingPrincipal * r);
        const principalPayment = Math.round(monthlyPayment - interestPayment);

        monthlyPaymentsArray.push({
          month: i + 1,
          total: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
        });

        remainingPrincipal -= principalPayment;
        totalPaid += monthlyPayment;
        totalInterestPaid += interestPayment;
      }
    } else if (repaymentMethod === "원금 균등상환") {
      let remainingPrincipal = p;
      const principalPayment = Math.round(p / n);

      for (let i = 0; i < n; i++) {
        const interestPayment = Math.round(remainingPrincipal * r);
        const monthlyPayment = principalPayment + interestPayment;

        monthlyPaymentsArray.push({
          month: i + 1,
          total: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
        });

        remainingPrincipal -= principalPayment;
        totalPaid += monthlyPayment;
        totalInterestPaid += interestPayment;
      }
    } else if (repaymentMethod === "만기 일시상환") {
      const monthlyInterest = Math.round(p * r);

      for (let i = 0; i < n - 1; i++) {
        monthlyPaymentsArray.push({
          month: i + 1,
          total: monthlyInterest,
          principal: 0,
          interest: monthlyInterest,
        });

        totalPaid += monthlyInterest;
        totalInterestPaid += monthlyInterest;
      }

      // 마지막 달 (원금 + 이자)
      monthlyPaymentsArray.push({
        month: n,
        total: p + monthlyInterest,
        principal: p,
        interest: monthlyInterest,
      });

      totalPaid += p + monthlyInterest;
      totalInterestPaid += monthlyInterest;
    }

    setInterest(monthlyPaymentsArray);
    setTotalPayment(totalPaid);
    setTotalInterest(totalInterestPaid);
  };

  return (
    <div className="calculator">
      <div className="calItem">
        대출 금액(원)
        <input
          type="text"
          value={principal}
          onChange={(e) => setPrincipal(formatNumber(e.target.value))}
        />
      </div>
      <div className="calItem">
        대출 이자율
        <input type="text" onChange={(e) => setRate(e.target.value)} />
      </div>
      <div className="calItem">
        상환 기간(년)
        <input type="text" onChange={(e) => setYear(e.target.value)} />
      </div>
      <div>
        상환 방법
        <select
          onChange={(e) => {
            setRepaymentMethod(e.target.value);
          }}
        >
          <option value="원리금 균등상환">원리금 균등상환</option>
          <option value="원금 균등상환">원금 균등상환</option>
          <option value="만기 일시상환">만기 일시상환</option>
        </select>
      </div>
      <div>
        <button onClick={InterestCalculator}>계산하기</button>
      </div>
      <h3>상환 방식 : {repaymentMethod}</h3>
      <h3>월별 납입 내역:</h3>
      <ul>
        {interest.map(({ month, total, principal, interest }) => (
          <li key={month}>
            {month}회차: 총 {total.toLocaleString()}원 (원금:{" "}
            {principal.toLocaleString()}원, 이자: {interest.toLocaleString()}원)
          </li>
        ))}
      </ul>
      <h3>총 납입 금액: {totalPayment.toLocaleString()} 원</h3>
      <h3>총 이자 금액: {totalInterest.toLocaleString()} 원</h3>
    </div>
  );
};

export default LoanCalculator;
