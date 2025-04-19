import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Deposit/InstallmentSavings.css";

const InstallmentSavings = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("기본순");
  const [viewOption, setViewOption] = useState("전체");

  // 적금 상품 목록
  const savingsProducts = [
    {
      id: 1,
      name: "SOUND 청년희망적금",
      interestRate: 4.0,
      maxInterestRate: 4.5,
      term: "12개월",
      minAmount: 10000,
      maxAmount: 1000000,
      monthlyDeposit: 100000,
      description: "만 19세~34세 청년을 위한 특별 적금 상품",
      targetAge: "19~34세",
      features: ["청년우대금리", "월 10만원 이상 납입", "만기일시지급식"]
    },
    {
      id: 2,
      name: "SOUND 노후준비적금",
      interestRate: 3.7,
      maxInterestRate: 4.0,
      term: "36개월",
      minAmount: 50000,
      maxAmount: 500000,
      monthlyDeposit: 50000,
      description: "안정적인 노후를 준비하시는 분들을 위한 적금",
      targetAge: "50세 이상",
      features: ["노후우대금리", "월 5만원 이상 납입", "만기일시지급식"]
    },
    {
      id: 3,
      name: "SOUND 자유적금",
      interestRate: 3.0,
      maxInterestRate: 3.2,
      term: "12개월",
      minAmount: 10000,
      maxAmount: 300000,
      monthlyDeposit: 10000,
      description: "자유로운 입출금이 가능한 적금 상품",
      targetAge: "전체",
      features: ["자유우대금리", "월 1만원 이상 납입", "자유입출금"]
    },
    {
      id: 4,
      name: "SOUND 꿈나무적금",
      interestRate: 3.5,
      maxInterestRate: 3.8,
      term: "24개월",
      minAmount: 10000,
      maxAmount: 200000,
      monthlyDeposit: 10000,
      description: "자녀의 미래를 위한 교육적금",
      targetAge: "만 18세 미만",
      features: ["교육우대금리", "월 1만원 이상 납입", "만기일시지급식"]
    },
    {
      id: 5,
      name: "SOUND 주거안정적금",
      interestRate: 3.8,
      maxInterestRate: 4.2,
      term: "24개월",
      minAmount: 100000,
      maxAmount: 1000000,
      monthlyDeposit: 100000,
      description: "주거안정을 위한 특별 적금",
      targetAge: "전체",
      features: ["주거우대금리", "월 10만원 이상 납입", "만기일시지급식"]
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
    navigate(`/installmentSavingsJoin/${product.name}`, { state: { product } });
  };

  // 검색 및 필터링 로직
  const filteredProducts = savingsProducts
    .filter((product) => {
      if (viewOption === "전체") return true;
      if (viewOption === "청년") return product.targetAge.includes("19~34세");
      if (viewOption === "노후") return product.targetAge.includes("50세");
      if (viewOption === "자녀") return product.targetAge.includes("18세");
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
    <div className="installment-savings-container">
      <h1 className="installment-savings-title">적금 상품</h1>
      
      <div className="deposit-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="상품명 검색"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-box">
          <select value={sortOption} onChange={handleSortChange}>
            <option value="기본순">기본순</option>
            <option value="금리높은순">금리높은순</option>
            <option value="금리낮은순">금리낮은순</option>
            <option value="기간짧은순">기간짧은순</option>
            <option value="기간긴순">기간긴순</option>
          </select>
          
          <select value={viewOption} onChange={handleViewChange}>
            <option value="전체">전체</option>
            <option value="청년">청년</option>
            <option value="노후">노후</option>
            <option value="자녀">자녀</option>
          </select>
        </div>
      </div>

      <div className="deposit-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="deposit-card"
            onClick={() => handleProductClick(product)}
          >
            <h2>{product.name}</h2>
            <div className="interest-rate">
              <span className="rate">{product.interestRate}%</span>
              {product.maxInterestRate && (
                <span className="max-rate">(최대 {product.maxInterestRate}%)</span>
              )}
            </div>
            <div className="product-details">
              <p>가입기간: {product.term}</p>
              <p>월 납입금액: {product.monthlyDeposit.toLocaleString()}원</p>
              <p>대상연령: {product.targetAge}</p>
            </div>
            <div className="product-features">
              {product.features.map((feature, index) => (
                <span key={index} className="feature-tag">
                  {feature}
                </span>
              ))}
            </div>
            <p className="product-description">{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstallmentSavings;