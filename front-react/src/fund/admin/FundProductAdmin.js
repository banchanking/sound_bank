import React, { useState, useEffect } from "react";
import Papa from "papaparse"; // CSV 파싱 라이브러리
import styles from "../../Css/fund/FundList.module.css"; // 스타일 파일 추가
import RefreshToken from "../../jwt/RefreshToken"; // RefreshToken 모듈 추가

const FundProductAdmin = () => {
  const [funds, setFunds] = useState([]); // CSV 파일에서 가져온 펀드 목록
  const [formData, setFormData] = useState({
    fund_name: "",
    fund_company: "",
    fund_type: "",
    fund_grade: "",
    fund_fee_rate: "",
    fund_upfront_fee: "",
    return_1m: 0,
    return_3m: 0,
    return_6m: 0,
    return_12m: 0,
    fund_risk_type: "",
  }); // 팝업창에서 입력할 폼 데이터
  
  const [isPopupOpen, setIsPopupOpen] = useState(false); // 팝업창 상태

  // CSV 파일에서 펀드 목록 가져오기
  const fetchFundsFromCSV = async () => {
    try {
      // 1. CSV 파일에서 펀드 목록 가져오기
      const response = await fetch("/data/fundList.csv"); // public 디렉토리의 CSV 파일 경로
      const csvText = await response.text(); // CSV 파일의 텍스트 데이터 가져오기
      
      // 2. 등록된 펀드 상품 목록 가져오기
      const registeredFundsResponse = await RefreshToken.get("http://localhost:8081/api/registeredFunds");
      const registeredFunds = registeredFundsResponse.data;
      const registeredFundNames = registeredFunds.map((fund) => fund.fund_name);

      // 3. CSV 데이터를 파싱하여 JSON 형식으로 변환
      Papa.parse(csvText, {
        header: true, // 첫 번째 행을 헤더로 사용
        skipEmptyLines: true, // 빈 줄 건너뛰기
        complete: (results) => {
          console.log("CSV Data:", results.data); // 파싱된 데이터 확인
          
          // 4. 등록된 상품을 제외한 목록 필터링
          const filteredFunds = results.data
            .filter((fund) => !registeredFundNames.includes(fund["fund_name"])
          );

          // 4-1. fund_risk_type 컬럼 제거
          const cleanedFunds = filteredFunds.map((fund) => ({
            fund_name: fund["fund_name"],
            fund_company: fund["fund_company"],
            fund_type: fund["fund_type"],
            fund_grade: fund["fund_grade"],
            fund_fee_rate: fund["fund_fee_rate"],
            fund_upfront_fee: fund["fund_upfront_fee"],
            return_1m: fund["return_1m"],
            return_3m: fund["return_3m"],
            return_6m: fund["return_6m"],
            return_12m: fund["return_12m"]
          }));

          // 5. 등록된 펀드 목록 저장
          setFunds(cleanedFunds); // 테이블에 표시할 데이터 저장 - 필터링된 데이터로 상태 업데이트
        },
      });
      
    } catch (error) {
      console.error("Error fetching CSV file:", error); // 오류 발생 시 콘솔에 출력
    }
  };

  // 컴포넌트가 처음 렌더링될 때 CSV 파일에서 펀드 목록을 가져옴
  useEffect(() => {
    fetchFundsFromCSV()
  }, []);

  // 팝업창 열기
  const handleOpenPopup = (fund) => {
    console.log("Selected Fund:", fund); // 선택된 펀드 확인
    setFormData({
      fund_name: fund["fund_name"] || "",
      fund_company: fund["fund_company"] || "",
      fund_type: fund["fund_type"] || "",
      fund_grade: fund["fund_grade"] || "",
      fund_fee_rate: fund["fund_fee_rate"] || "",
      fund_upfront_fee: fund["fund_upfront_fee"] || "",
      return_1m: fund["return_1m"] || 0,
      return_3m: fund["return_3m"] || 0,
      return_6m: fund["return_6m"] || 0,
      return_12m: fund["return_12m"] || 0,
      fund_risk_type: fund["fund_risk_type"] || "",
      
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
      fund_upfront_fee: "",
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

  // 등록된 펀드 목록 저장
  const saveRegisteredFunds = async (funds) => {
    try {
      await RefreshToken.post(
        "http://localhost:8081/api/saveRegisteredFunds",
        funds // ✅ Axios는 두 번째 인자가 전송할 데이터입니다
      );
      console.log("Registered funds saved successfully");
    } catch (error) {
      console.error("Error saving registered funds:", error);
    }
  };

  // 펀드 등록
  const handleSaveFund = async () => {
    try {
      // 1. 등록된 펀드 상품 목록 가져오기     
      // Axios 인스턴스 RefreshToken 사용
      await RefreshToken.post(
        "http://localhost:8081/api/fundSave",
        formData
      );

      console.log("펀드 등록 성공");
      alert("펀드상품 등록 성공!");

      // 등록된 펀드를 목록에서 제거
      const updatedFunds = funds.filter(
        (fund) => fund.fund_name !== formData.fund_name
      );
      setFunds(updatedFunds);

      handleClosePopup(); // 팝업창 닫기

    } catch (error) {
      console.error("Error saving fund:", error);
      alert("펀드 등록 중 오류가 발생했습니다.");
      }
    };

  return (
    <div className={styles.fundContainer}>
      <h2>펀드 상품 관리</h2>

      {/* 펀드 목록 테이블 */}
      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>펀드명</th>
            <th>운용사명</th>
            <th>펀드유형</th>
            <th>펀드등급</th>
            <th>총보수 (%)</th>
            <th>선취수수료 (%)</th>
            <th>1개월 수익률 (%)</th>
            <th>3개월 수익률 (%)</th>
            <th>6개월 수익률 (%)</th>
            <th>12개월 수익률 (%)</th>
            <th>선택</th>
          </tr>
        </thead>
        <tbody>
          {funds.map((fund, index) => (
            <tr key={`${fund["상품명"]}-${index}`}>
              <td>{fund["fund_name"]}</td>
              <td>{fund["fund_company"]}</td>
              <td>{fund["fund_type"]}</td>
              <td>{fund["fund_grade"]}</td>
              <td>{fund["fund_fee_rate"]}</td>
              <td>{fund["fund_upfront_fee"]}</td>
              <td>{fund["return_1m"]}</td>
              <td>{fund["return_3m"]}</td>
              <td>{fund["return_6m"]}</td>
              <td>{fund["return_12m"]}</td>
              <td>
                <button onClick={() => handleOpenPopup(fund)}>등록</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 펀드 등록 팝업 */}
      {isPopupOpen && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupModal}>
            <div className={styles.popupHeader}>
              <h3>펀드 등록</h3>
              <span className={styles.closeButton} onClick={handleClosePopup}>
                &times;
              </span>
            </div>
            <div className="popup-body">  
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
                  <label>선취수수료:</label>
                  <input
                    type="number"
                    name="fund_upfront_fee"
                    value={formData.fund_upfront_fee}
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
                  <div className={styles.actionbuttons}>
                    <button type="submit">저장</button>
                    <button type="button" onClick={handleClosePopup}>
                      닫기
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default FundProductAdmin;