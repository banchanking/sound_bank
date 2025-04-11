import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Deposit/FixedDeposit.css"; // CSS 파일 import

const FixedDeposit = () => {
  const navigate = useNavigate(); // React Router의 navigate 함수 사용
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [sortOption, setSortOption] = useState("추천순"); // 정렬 옵션 상태
  const [viewOption, setViewOption] = useState("5개"); // 조회 옵션 상태
  const [selectedChannels, setSelectedChannels] = useState([]); // 체크박스 선택 상태

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

  const handleChannelChange = (channel) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const handleSearch = () => {
    console.log("검색어:", searchTerm);
    console.log("선택된 채널:", selectedChannels);
    console.log("정렬 옵션:", sortOption);
    console.log("조회 옵션:", viewOption);
  };

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

      {/* 상단 필터 */}
      <table className="filter-table">
        <tbody>
          <tr>
            <td>
              <label>
                <input
                  type="checkbox"
                  value="인터넷"
                  onChange={() => handleChannelChange("인터넷")}
                />
                인터넷
              </label>
            </td>
            <td>
              <label>
                <input
                  type="checkbox"
                  value="모바일"
                  onChange={() => handleChannelChange("모바일")}
                />
                모바일
              </label>
            </td>
            <td>
              <label>
                <input
                  type="checkbox"
                  value="영업점"
                  onChange={() => handleChannelChange("영업점")}
                />
                영업점
              </label>
            </td>
            <td>
              <label>
                <input
                  type="checkbox"
                  value="전화신규"
                  onChange={() => handleChannelChange("전화신규")}
                />
                전화신규
              </label>
            </td>
            <td>
              <input
                type="text"
                placeholder="상품명 입력"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </td>
            <td>
              <button onClick={handleSearch} className="search-button">
                검색
              </button>
            </td>
          </tr>
        </tbody>
      </table>

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