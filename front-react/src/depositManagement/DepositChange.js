import React, { useState } from "react";
import "../Css/Deposit/DepositChange.css"; // CSS 파일 import

const DepositChange = () => {
  const [sortOption, setSortOption] = useState("추천순"); // 정렬 옵션 상태
  const [viewOption, setViewOption] = useState("5개"); // 조회 옵션 상태

  const depositChangeList = [
    {
      id: 1,
      name: "정기예금 전환",
      interestRate: "3.5%",
      minAmount: "1,000,000원",
      maxAmount: "50,000,000원",
      term: "12개월",
    },
    {
      id: 2,
      name: "자유적금 전환",
      interestRate: "3.2%",
      minAmount: "500,000원",
      maxAmount: "30,000,000원",
      term: "6개월 ~ 24개월",
    },
    {
      id: 3,
      name: "청년희망적금 전환",
      interestRate: "4.0%",
      minAmount: "100,000원",
      maxAmount: "10,000,000원",
      term: "24개월",
    },
    {
      id: 4,
      name: "스마트 정기예금 전환",
      interestRate: "3.8%",
      minAmount: "1,000,000원",
      maxAmount: "100,000,000원",
      term: "6개월 ~ 36개월",
    },
    {
      id: 5,
      name: "우대 정기예금 전환",
      interestRate: "4.2%",
      minAmount: "5,000,000원",
      maxAmount: "50,000,000원",
      term: "12개월 ~ 36개월",
    },
  ];

  return (
    <div className="deposit-change-container">
      <h1 className="deposit-change-title">입출금계좌전환</h1>

      {/* 안내 및 유의사항 */}
      <div className="deposit-change-info">
        <h2>안내 및 유의사항</h2>
        <ul>
          <li>예금 전환은 인터넷, 모바일, 영업점을 통해 가능합니다.</li>
          <li>전환 시 기존 약정 금리가 변경될 수 있습니다.</li>
          <li>상품 전환 시 약관을 반드시 확인하시기 바랍니다.</li>
          <li>비과세 혜택은 관련 법령에 따라 적용됩니다.</li>
          <li>상품 내용은 사전 고지 후 변경될 수 있습니다.</li>
        </ul>
      </div>

      {/* 정렬 및 조회 옵션 */}
      <div className="options-container">
        <div className="sort-buttons">
          <button
            className={sortOption === "추천순" ? "active" : ""}
            onClick={() => setSortOption("추천순")}
          >
            추천순
          </button>
          <button
            className={sortOption === "판매순" ? "active" : ""}
            onClick={() => setSortOption("판매순")}
          >
            판매순
          </button>
          <button
            className={sortOption === "출시순" ? "active" : ""}
            onClick={() => setSortOption("출시순")}
          >
            출시순
          </button>
          <button
            className={sortOption === "상품명순" ? "active" : ""}
            onClick={() => setSortOption("상품명순")}
          >
            상품명순
          </button>
        </div>
        <div className="view-dropdown-container">
          <select
            value={viewOption}
            onChange={(e) => setViewOption(e.target.value)}
            className="view-dropdown"
          >
            <option value="5개">5개</option>
            <option value="10개">10개</option>
            <option value="전체">전체</option>
          </select>
        </div>
      </div>

      {/* 상품 목록 */}
      <table className="deposit-change-table">
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
          {depositChangeList.map((product) => (
            <tr key={product.id}>
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

export default DepositChange;