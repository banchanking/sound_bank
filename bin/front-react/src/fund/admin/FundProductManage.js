import React, { useState, useEffect } from "react";
import "../../Css/fund/Fund.css"; // 스타일 파일 추가

const FundProductManage = () => {
  const [dropdownFunds, setDropdownFunds] = useState([]); // 드롭다운에 표시할 펀드 목록
  const [formData, setFormData] = useState({
    FUND_ID: "", // 펀드 ID는 읽기 전용
    FUND_NAME: "",
    FUND_COMPANY: "",
    FUND_TYPE: "",
    FUND_GRADE: "",
    FUND_FEE_RATE: "",
    RETURN_1M: 0,
    RETURN_3M: 0,
    RETURN_6M: 0,
    RETURN_12M: 0,
  });

  // 펀드 목록 조회
  const fetchFundsFromAPI = async () => {
    try {
      const response = await fetch("http://15.165.57.30:8081/api/fundList"); // 백엔드 API URL
      if (!response.ok) {
        throw new Error("Failed to fetch fund list");
      }
      const data = await response.json();
      setDropdownFunds(data); // 드롭다운에 표시할 데이터 저장
    } catch (error) {
      console.error("Error fetching fund list:", error);
    }
  };

  // useEffect에서 API 호출
  useEffect(() => {
    fetchFundsFromAPI();
  }, []);

  // 드롭다운에서 펀드 선택
  const handleDropdownChange = (e) => {
    const selected = dropdownFunds.find((fund) => fund.FUND_NAME === e.target.value);
    if (selected) {
      setFormData({
        FUND_ID: selected.FUND_ID,
        FUND_NAME: selected.FUND_NAME,
        FUND_COMPANY: selected.FUND_COMPANY,
        FUND_TYPE: selected.FUND_TYPE,
        FUND_GRADE: selected.FUND_GRADE,
        FUND_FEE_RATE: selected.FUND_FEE_RATE,
        RETURN_1M: selected.RETURN_1M,
        RETURN_3M: selected.RETURN_3M,
        RETURN_6M: selected.RETURN_6M,
        RETURN_12M: selected.RETURN_12M,
      });
    }
  };

  // 폼 데이터 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 펀드 수정
  const handleUpdateFund = async () => {
    try {
      const response = await fetch(`http://15.165.57.30:8081/api/fundUpdate/${formData.FUND_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update fund");
      }

      console.log("펀드 수정 성공");
      fetchFundsFromAPI(); // 목록 갱신
    } catch (error) {
      console.error("Error updating fund:", error);
    }
  };

  // 펀드 삭제
  const handleDeleteFund = async () => {
    try {
      const response = await fetch(`http://15.165.57.30:8081/api/fund/${formData.FUND_ID}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete fund");
      }

      console.log("펀드 삭제 성공");
      fetchFundsFromAPI(); // 목록 갱신
      setFormData({
        FUND_ID: "",
        FUND_NAME: "",
        FUND_COMPANY: "",
        FUND_TYPE: "",
        FUND_GRADE: "",
        FUND_FEE_RATE: "",
        RETURN_1M: 0,
        RETURN_3M: 0,
        RETURN_6M: 0,
        RETURN_12M: 0,
      }); // 폼 초기화
    } catch (error) {
      console.error("Error deleting fund:", error);
    }
  };

  return (
    <div className="fund-product-manage-container">
      <h2>펀드 상품 관리</h2>

      {/* 펀드 수정/삭제 폼 */}
      <div className="fund-form-container">
        <h3>펀드 수정/삭제</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateFund();
          }}
        >
          <div>
            <label>펀드 ID:</label>
            <input
              type="text"
              name="FUND_ID"
              value={formData.FUND_ID}
              readOnly // FUND_ID는 읽기 전용
            />
          </div>

          <div>
            <label>펀드 선택:</label>
            <select onChange={handleDropdownChange} defaultValue="">
              <option value="" disabled>
                펀드를 선택하세요
              </option>
              {dropdownFunds.map((fund, index) => (
                <option key={index} value={fund.FUND_NAME}>
                  {fund.FUND_NAME}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>펀드 이름:</label>
            <input
              type="text"
              name="FUND_NAME"
              value={formData.FUND_NAME}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>운용사명:</label>
            <input
              type="text"
              name="FUND_COMPANY"
              value={formData.FUND_COMPANY}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>펀드 유형:</label>
            <input
              type="text"
              name="FUND_TYPE"
              value={formData.FUND_TYPE}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>펀드 등급:</label>
            <input
              type="number"
              name="FUND_GRADE"
              value={formData.FUND_GRADE}
              onChange={handleChange}
              min="1"
              max="10"
            />
          </div>
          <div>
            <label>총보수 (%):</label>
            <input
              type="number"
              name="FUND_FEE_RATE"
              value={formData.FUND_FEE_RATE}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div>
            <label>1개월 수익률 (%):</label>
            <input
              type="number"
              name="RETURN_1M"
              value={formData.RETURN_1M}
              readOnly
            />
          </div>
          <div>
            <label>3개월 수익률 (%):</label>
            <input
              type="number"
              name="RETURN_3M"
              value={formData.RETURN_3M}
              readOnly
            />
          </div>
          <div>
            <label>6개월 수익률 (%):</label>
            <input
              type="number"
              name="RETURN_6M"
              value={formData.RETURN_6M}
              readOnly
            />
          </div>
          <div>
            <label>12개월 수익률 (%):</label>
            <input
              type="number"
              name="RETURN_12M"
              value={formData.RETURN_12M}
              readOnly
            />
          </div>
          <button type="submit">수정</button>
          <button type="button" onClick={handleDeleteFund}>
            삭제
          </button>
        </form>
      </div>
    </div>
  );
};

export default FundProductManage;