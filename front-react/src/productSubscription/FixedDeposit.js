import React from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Deposit/FixedDeposit.css"; // CSS 파일 import

const FixedDeposit = () => {
  const navigate = useNavigate(); // React Router의 navigate 함수 사용

  const depositProducts = [
    {
      id: 1,
      name: "정기예금",
      interestRate: "3.5%",
      minAmount: "1,000,000원",
      maxAmount: "50,000,000원",
      term: "12개월",
    },
    {
      id: 2,
      name: "자유적금",
      interestRate: "3.2%",
      minAmount: "500,000원",
      maxAmount: "30,000,000원",
      term: "6개월 ~ 24개월",
    },
    {
      id: 3,
      name: "청년희망적금",
      interestRate: "4.0%",
      minAmount: "100,000원",
      maxAmount: "10,000,000원",
      term: "24개월",
    },
    {
      id: 4,
      name: "스마트 정기예금",
      interestRate: "3.8%",
      minAmount: "1,000,000원",
      maxAmount: "100,000,000원",
      term: "6개월 ~ 36개월",
    },
    {
      id: 5,
      name: "우대 정기예금",
      interestRate: "4.2%",
      minAmount: "5,000,000원",
      maxAmount: "50,000,000원",
      term: "12개월 ~ 36개월",
    },
  ];

  const handleRowClick = (product) => {

  const customerId = localStorage.getItem("customerId"); // 로컬 스토리지에서 고객 ID 가져오기
  const customerAccountNumber = localStorage.getItem("customer_account_number"); // 로컬 스토리지에서 고객 계좌 번호 가져오기 



        // DepositJoin으로 데이터 전달
        navigate(`/DepositJoin/${product.name}`, {
          state: {
            product,
            customerId,
            customerAccountNumber,
          },
        });
      };

  return (
    <div className="fixed-deposit-container">
      <h1 className="fixed-deposit-title">예금 상품 목록</h1>
      <table className="fixed-deposit-table">
        <thead>
          <tr>
            <th>상품명</th>
            <th>금리</th>
            <th>최소 금액</th>
            <th>최대 금액</th>
            <th>기간</th>
          </tr>
        </thead>
        <tbody>
          {depositProducts.map((product) => (
            <tr
              key={product.id}
              onClick={() => handleRowClick(product)} // 클릭 이벤트 추가
              style={{ cursor: "pointer" }}
            >
              <td>{product.name}</td>
              <td>{product.interestRate}</td>
              <td>{product.minAmount}</td>
              <td>{product.maxAmount}</td>
              <td>{product.term}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FixedDeposit;