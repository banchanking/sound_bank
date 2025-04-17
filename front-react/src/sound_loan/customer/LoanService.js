import React, { useState } from "react";
import LoanCalculator from "./LoanCalculator";

import LoanCreditScore from "./LoanCreditScore";
import "../../Css/loan/LoanService.css";

const LoanService = () => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [showCreditScore, setShowCreditScore] = useState(false);

  const loanCalculator = () => {
    setShowCalculator(true);
    setShowCreditScore(false);
  };

  const loanCreditScore = () => {
    setShowCalculator(false);
    setShowCreditScore(true);
  };

  return (
    <div style={{ minHeight: 600, textAlign: "center" }}>
      <div className="serviceBtn">
        <button style={{ width: 200 }} onClick={loanCalculator}>
          대출 계산기
        </button>
        <button style={{ width: 200 }} onClick={loanCreditScore}>
          내 신용점수 보기
        </button>
      </div>
      <div>
        {showCalculator && <LoanCalculator />}
        {showCreditScore && <LoanCreditScore />}
      </div>
    </div>
  );
};

export default LoanService;
