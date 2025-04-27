import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import styles from "../../Css/fund/FundAdmin.module.css";
import style from "../../Css/exchange/ExList.module.css"; // 페이지네이션 스타일
import RefreshToken from "../../jwt/RefreshToken";

const FundProductAdmin = () => {
  const [funds, setFunds] = useState([]);
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
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // CSV + 등록된 펀드 조회 후 필터링
  const fetchFundsFromCSV = async () => {
    try {
      const response = await fetch("/data/fundList.csv");
      const csvText = await response.text();
  
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const allFunds = results.data.map((fund) => ({
            fund_name: fund.fund_name,
            fund_company: fund.fund_company,
            fund_type: fund.fund_type,
            fund_grade: fund.fund_grade,
            fund_fee_rate: fund.fund_fee_rate,
            fund_upfront_fee: fund.fund_upfront_fee,
            return_1m: fund.return_1m,
            return_3m: fund.return_3m,
            return_6m: fund.return_6m,
            return_12m: fund.return_12m,
            fund_risk_type: fund.fund_risk_type,
          }));
  
          // 🚨 필터링 없이 전부 보여준다 (임시)
          setFunds(allFunds);
        },
      });
    } catch (error) {
      console.error("❌ CSV 불러오기 실패:", error);
    }
  };  

  useEffect(() => {
    fetchFundsFromCSV();
  }, []);

  // 📌 등록 팝업 열기
  const handleOpenPopup = (fund) => {
    setFormData({
      fund_name: fund.fund_name || "",
      fund_company: fund.fund_company || "",
      fund_type: fund.fund_type || "",
      fund_grade: fund.fund_grade || "",
      fund_fee_rate: fund.fund_fee_rate || "",
      fund_upfront_fee: fund.fund_upfront_fee || "",
      return_1m: fund.return_1m || 0,
      return_3m: fund.return_3m || 0,
      return_6m: fund.return_6m || 0,
      return_12m: fund.return_12m || 0,
      fund_risk_type: fund.fund_risk_type || "",
    });
    setIsPopupOpen(true);
  };

  // 📌 등록 팝업 닫기
  const handleClosePopup = () => {
    setIsPopupOpen(false);
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
      fund_risk_type: "",
    });
  };

  // 📌 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 📌 펀드 하나 등록 (fund_risk_type은 빼고 저장)
  const handleSaveFund = async () => {
    console.log("저장하려는 데이터:", formData);
    try {
      const { fund_risk_type, ...fundWithoutRiskType } = formData;
      const response = await RefreshToken.post("/fundSave", fundWithoutRiskType);
      console.log("서버 응답:", response.data);
      alert("펀드상품 등록 성공!");
      const updatedFunds = funds.filter(
        (fund) => fund.fund_name !== formData.fund_name
      );
      setFunds(updatedFunds);
      handleClosePopup();
    } catch (error) {
      console.error("❌ 펀드 저장 오류:", error);
      alert("펀드 등록 중 오류 발생");
    }
  };

  // 📌 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFunds = funds.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>펀드 상품 등록</h2>

      {/* 📄 펀드 리스트 테이블 */}
      <table className={styles.fundInsertTable}>
        <thead>
          <tr>
            <th>펀드명</th>
            <th>운용사명</th>
            <th>펀드유형</th>
            <th>펀드등급</th>
            <th>총보수 (%)</th>
            <th>선취수수료 (%)</th>
            <th>1개월 수익률</th>
            <th>3개월 수익률</th>
            <th>6개월 수익률</th>
            <th>12개월 수익률</th>
            <th>선택</th>
          </tr>
        </thead>
        <tbody className={styles.fundTable}>
          {currentFunds.map((fund, index) => (
            <tr key={`${fund.fund_name}-${index}`}>
              <td>{fund.fund_name}</td>
              <td>{fund.fund_company}</td>
              <td>{fund.fund_type}</td>
              <td>{fund.fund_grade}</td>
              <td>{fund.fund_fee_rate}</td>
              <td>{fund.fund_upfront_fee}</td>
              <td>{fund.return_1m}</td>
              <td>{fund.return_3m}</td>
              <td>{fund.return_6m}</td>
              <td>{fund.return_12m}</td>
              <td>
                <button
                  className={styles.fundButton}
                  onClick={() => handleOpenPopup(fund)}
                >
                  등록
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📄 페이지네이션 */}
      <div className={style.pagination} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <button
          className={style.exListBtn}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ◀ 이전
        </button>
        <span>{currentPage} / {Math.ceil(funds.length / itemsPerPage)}</span>
        <button
          className={style.exListBtn}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(funds.length / itemsPerPage)))}
          disabled={currentPage === Math.ceil(funds.length / itemsPerPage)}
        >
          다음 ▶
        </button>
      </div>

      {/* 📄 등록 팝업 */}
      {isPopupOpen && (
        <div className={styles.fundpopupOverlay}>
          <div className={styles.fundpopupModal}>
            <div className={styles.fundpopupHeader}>
              <h3>펀드 등록</h3>
              <button className={styles.closeButton} onClick={handleClosePopup}>
                ×
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveFund(); }}>
              <div>
                <label>펀드 이름:</label>
                <input type="text" name="fund_name" value={formData.fund_name} className={styles.rateInput} onChange={handleChange} />
              </div>
              <div>
                <label>운용사명:</label>
                <input type="text" name="fund_company" value={formData.fund_company} className={styles.rateInput} onChange={handleChange} />
              </div>
              <div>
                <label>펀드 유형:</label>
                <input type="text" name="fund_type" value={formData.fund_type} className={styles.rateInput} onChange={handleChange} />
              </div>
              <div>
                <label>펀드 등급:</label>
                <input type="number" name="fund_grade" value={formData.fund_grade} className={styles.feeInput} onChange={handleChange} />
              </div>
              <div>
                <label>총보수 (%):</label>
                <input type="number" name="fund_fee_rate" value={formData.fund_fee_rate} className={styles.feeInput} onChange={handleChange} />
              </div>
              <div>
                <label>선취수수료 (%):</label>
                <input type="number" name="fund_upfront_fee" value={formData.fund_upfront_fee} className={styles.feeInput} onChange={handleChange} />
              </div>
              <div className={styles.actionbuttons}>
                <button type="submit" className={styles.fundInsertButton}>저장</button>
                <button type="button" className={styles.fundInsertButton2} onClick={handleClosePopup}>닫기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundProductAdmin;
