import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Deposit/FixedDeposit.css";

const FixedDeposit = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("기본순");
  const [viewOption, setViewOption] = useState("전체");

  // 예금 상품 목록
  const depositProducts = [
    {
      id: 1,
      name: "SOUND 프리미엄예금",
      interestRate: 3.5,
      maxInterestRate: 4.0,
      term: "12개월",
      minAmount: 1000000,
      maxAmount: 10000000,
      description: "고객님의 자산을 안전하게 관리해드리는 프리미엄 예금",
      targetAge: "전체",
      features: ["우대금리", "자유로운 입출금", "온라인 거래 가능"]
    },
    {
      id: 2,
      name: "SOUND 정기예금",
      interestRate: 3.2,
      maxInterestRate: 3.5,
      term: "6개월",
      minAmount: 500000,
      maxAmount: 5000000,
      description: "안정적인 수익을 원하시는 분들을 위한 정기예금",
      targetAge: "전체",
      features: ["정기예금", "만기일시지급식", "온라인 거래 가능"]
    },
    {
      id: 3,
      name: "SOUND 자유예금",
      interestRate: 2.8,
      maxInterestRate: 3.0,
      term: "3개월",
      minAmount: 100000,
      maxAmount: 3000000,
      description: "자유로운 입출금이 가능한 예금 상품",
      targetAge: "전체",
      features: ["자유입출금", "온라인 거래 가능", "모바일 뱅킹 지원"]
    },
    {
      id: 4,
      name: "SOUND 청년예금",
      interestRate: 3.3,
      maxInterestRate: 3.7,
      term: "12개월",
      minAmount: 100000,
      maxAmount: 2000000,
      description: "청년을 위한 특별 예금 상품",
      targetAge: "19~34세",
      features: ["청년우대금리", "온라인 거래 가능", "모바일 뱅킹 지원"]
    },
    {
      id: 5,
      name: "SOUND 노후예금",
      interestRate: 3.4,
      maxInterestRate: 3.8,
      term: "24개월",
      minAmount: 1000000,
      maxAmount: 10000000,
      description: "안정적인 노후를 위한 예금 상품",
      targetAge: "50세 이상",
      features: ["노후우대금리", "만기일시지급식", "온라인 거래 가능"]
    }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleViewChange = (e) => {
    setViewOption(e.target.value);
  };

  const handleProductClick = (product) => {
    navigate(`/DepositJoin/${encodeURIComponent(product.name)}`, { 
      state: { 
        product,
        customerId: localStorage.getItem("customerId")
      } 
    });
  };

  // 검색 및 필터링 로직
  const filteredProducts = depositProducts
    .filter((product) => {
      if (viewOption === "전체") return true;
      if (viewOption === "청년") return product.targetAge.includes("19~34세");
      if (viewOption === "노후") return product.targetAge.includes("50세");
      return true;
    })
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case "금리높은순":
          return b.interestRate - a.interestRate;
        case "금리낮은순":
          return a.interestRate - b.interestRate;
        case "기간짧은순":
          return parseInt(a.term) - parseInt(b.term);
        case "기간긴순":
          return parseInt(b.term) - parseInt(a.term);
        default:
          return 0;
      }
    });

  return (
    <div className="fixed-deposit-container">
      <h1 className="fixed-deposit-title">예금 상품</h1>
      
      <div className="filter-table">
        <div className="search-box">
          <input
            type="text"
            placeholder="상품명 검색"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="options-container">
          <div className="sort-buttons">
            <select value={sortOption} onChange={handleSortChange} className="view-dropdown">
              <option value="기본순">기본순</option>
              <option value="금리높은순">금리높은순</option>
              <option value="금리낮은순">금리낮은순</option>
              <option value="기간짧은순">기간짧은순</option>
              <option value="기간긴순">기간긴순</option>
            </select>
          </div>
          
          <div className="view-dropdown-container">
            <select value={viewOption} onChange={handleViewChange} className="view-dropdown">
              <option value="전체">전체</option>
              <option value="청년">청년</option>
              <option value="노후">노후</option>
            </select>
          </div>
        </div>
      </div>

      <table className="fixed-deposit-table">
        <thead>
          <tr>
            <th>상품명</th>
            <th>금리</th>
            <th>기간</th>
            <th>최소금액</th>
            <th>최대금액</th>
            <th>대상연령</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id} onClick={() => handleProductClick(product)}>
              <td>{product.name}</td>
              <td>
                {product.interestRate}%
                {product.maxInterestRate && ` (최대 ${product.maxInterestRate}%)`}
              </td>
              <td>{product.term}</td>
              <td>{product.minAmount.toLocaleString()}원</td>
              <td>{product.maxAmount.toLocaleString()}원</td>
              <td>{product.targetAge}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FixedDeposit;