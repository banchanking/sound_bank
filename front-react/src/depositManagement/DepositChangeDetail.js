import React from "react";
import { useLocation } from "react-router-dom";

const DepositChangeDetail = () => {
  const location = useLocation();
  const { product } = location.state || {}; // 전달된 상품 정보

  if (!product) {
    return <div>상품 정보가 없습니다.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>{product.name} 상세정보</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <tbody>
          <tr>
            <td style={{ border: "1px solid black", padding: "10px" }}>금리</td>
            <td style={{ border: "1px solid black", padding: "10px" }}>{product.interestRate}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid black", padding: "10px" }}>최소 금액</td>
            <td style={{ border: "1px solid black", padding: "10px" }}>{product.minAmount}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid black", padding: "10px" }}>최대 금액</td>
            <td style={{ border: "1px solid black", padding: "10px" }}>{product.maxAmount}</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid black", padding: "10px" }}>기간</td>
            <td style={{ border: "1px solid black", padding: "10px" }}>{product.term}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DepositChangeDetail;