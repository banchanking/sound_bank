import React, { useState, useEffect } from "react";
import Papa from "papaparse"; // CSV 파싱 라이브러리
import "../../Css/fund/Fund.css"; // 스타일 파일 추가

const FundProductAdmin = () => {
  const [funds, setFunds] = useState([]); // CSV 파일에서 가져온 펀드 목록
  const [formData, setFormData] = useState({
    fund_name: "",
    fund_company: "",
    fund_type: "",
    fund_grade: "",
    fund_fee_rate: "",
    return_1m: 0,
    return_3m: 0,
    return_6m: 0,
    return_12m: 0,
  }); // 팝업창에서 입력할 폼 데이터
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업창 상태

  // CSV 파일에서 펀드 목록 가져오기
  const fetchFundsFromCSV = async () => {
    try {
      const response = await fetch("/data/fundList.csv"); // public 디렉토리의 CSV 파일 경로
      const csvText = await response.text(); // CSV 파일의 텍스트 데이터 가져오기

      // CSV 데이터를 파싱하여 JSON 형식으로 변환
      Papa.parse(csvText, {
        header: true, // 첫 번째 행을 헤더로 사용
        skipEmptyLines: true, // 빈 줄 건너뛰기
        complete: (results) => {
          console.log("CSV Data:", results.data); // 파싱된 데이터 확인
          setFunds(results.data); // 테이블에 표시할 데이터 저장
        },
      });
    } catch (error) {
      console.error("Error fetching CSV file:", error); // 오류 발생 시 콘솔에 출력
    }
  };

  // 컴포넌트가 처음 렌더링될 때 CSV 파일에서 펀드 목록을 가져옴
  useEffect(() => {
    fetchFundsFromCSV();
  }, []);

  // 팝업창 열기
  const handleOpenPopup = (fund) => {
    setFormData({
      fund_name: fund["상품명"] || "",
      fund_company: fund["운용사명"] || "",
      fund_type: fund["펀드유형"] || "",
      fund_grade: fund["펀드등급"] || "",
      fund_fee_rate: fund["총보수(퍼센트)"] || "",
      return_1m: fund["1개월누적수익률(퍼센트)"] || 0,
      return_3m: fund["3개월누적수익률(퍼센트)"] || 0,
      return_6m: fund["6개월누적수익률(퍼센트)"] || 0,
      return_12m: fund["12개월누적수익률(퍼센트)"] || 0,
    });
    setIsPopupOpen(true); // 팝업창 열기
  };

  // 팝업창 닫기
  const handleClosePopup = () => {
    setIsPopupOpen(false); // 팝업창 닫기
    setFormData({
      fund_name: "",
      fund_company: "",
      fund_type: "",
      fund_grade: "",
      fund_fee_rate: "",
      return_1m: 0,
      return_3m: 0,
      return_6m: 0,
      return_12m: 0,
    }); // 폼 초기화
  };

  // 폼 데이터 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 펀드 등록
  const handleSaveFund = async () => {
    try {
      const response = await fetch("http://15.165.57.30:8081/api/fundSave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("펀드 등록 실패");
      }

      console.log("펀드 등록 성공");
      handleClosePopup(); // 팝업창 닫기
    } catch (error) {
      console.error("Error saving fund:", error);
    }
  };

  return (
    <div className="fund-product-admin-container">
      <h2>펀드 상품 관리</h2>

      {/* 펀드 목록 테이블 */}
      <table className="fund-table">
        <thead>
          <tr>
            <th>펀드명</th>
            <th>운용사명</th>
            <th>펀드유형</th>
            <th>펀드등급</th>
            <th>총보수 (%)</th>
            <th>1개월 수익률 (%)</th>
            <th>3개월 수익률 (%)</th>
            <th>6개월 수익률 (%)</th>
            <th>12개월 수익률 (%)</th>
            <th>선택</th>
          </tr>
        </thead>
        <tbody>
          {funds.map((fund, index) => (
            <tr key={index}>
              <td>{fund["상품명"]}</td>
              <td>{fund["운용사명"]}</td>
              <td>{fund["펀드유형"]}</td>
              <td>{fund["펀드등급"]}</td>
              <td>{fund["총보수(퍼센트)"]}</td>
              <td>{fund["1개월누적수익률(퍼센트)"]}</td>
              <td>{fund["3개월누적수익률(퍼센트)"]}</td>
              <td>{fund["6개월누적수익률(퍼센트)"]}</td>
              <td>{fund["12개월누적수익률(퍼센트)"]}</td>
              <td>
                <button onClick={() => handleOpenPopup(fund)}>등록</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 펀드 등록 팝업 */}
      {isPopupOpen && (
        <div className="popup-container">
          <div className="popup">
            <h3>펀드 등록</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveFund();
              }}
            >
              <div>
                <label>펀드 이름:</label>
                <input
                  type="text"
                  name="fund_name"
                  value={formData.fund_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>운용사명:</label>
                <input
                  type="text"
                  name="fund_company"
                  value={formData.fund_company}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>펀드 유형:</label>
                <input
                  type="text"
                  name="fund_type"
                  value={formData.fund_type}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>펀드 등급:</label>
                <input
                  type="number"
                  name="fund_grade"
                  value={formData.fund_grade}
                  onChange={handleChange}
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label>총보수 (%):</label>
                <input
                  type="number"
                  name="fund_fee_rate"
                  value={formData.fund_fee_rate}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
              <div>
                <label>1개월 수익률 (%):</label>
                <input
                  type="number"
                  name="return_1m"
                  value={formData.return_1m}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
              <div>
                <label>3개월 수익률 (%):</label>
                <input
                  type="number"
                  name="return_3m"
                  value={formData.return_3m}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
              <div>
                <label>6개월 수익률 (%):</label>
                <input
                  type="number"
                  name="return_6m"
                  value={formData.return_6m}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
              <div>
                <label>12개월 수익률 (%):</label>
                <input
                  type="number"
                  name="return_12m"
                  value={formData.return_12m}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>
              <button type="submit">저장</button>
              <button type="button" onClick={handleClosePopup}>
                닫기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundProductAdmin;