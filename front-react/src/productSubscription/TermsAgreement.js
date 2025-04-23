import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TermsAgreement = () => {
  const [isAgreed, setIsAgreed] = useState(false); // 약관 동의 상태
  const navigate = useNavigate();
  const location = useLocation();
  const { product, customerId, customerAccountNumber } = location.state || {}; // 전달된 데이터

  const handleAgree = () => {
    if (isAgreed) {
      // 약관에 동의한 경우 DepositJoin으로 이동
      navigate(`/DepositJoin/${product.name}`, {
        state: {
          product,
          customerId,
          customerAccountNumber,
        },
      });
    } else {
      alert("약관에 동의해야 합니다.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>약관 동의</h1>
      <p>아래 약관을 읽고 동의해주세요.</p>
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
        <p>여기에 약관 내용을 입력하세요...</p>
      </div>
      <label>
        <input
          type="checkbox"
          checked={isAgreed}
          onChange={(e) => setIsAgreed(e.target.checked)}
        />
        약관에 동의합니다.
      </label>
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleAgree}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          동의하고 진행
        </button>
      </div>
    </div>
  );
};

export default TermsAgreement;