import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import styles from "../../Css/fund/FundAdmin.module.css";
import style from "../../Css/exchange/ExList.module.css"; // 새로운 스타일 파일
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
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const itemsPerPage = 10; // 페이지당 표시할 항목 수

  const fetchFundsFromCSV = async () => {
    try {
      const response = await fetch("/data/fundList.csv");
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log("📄 CSV 전체 펀드:", results.data.map((f) => f.fund_name));
          const cleanedFunds = results.data.map((fund) => ({
            return_12m: fund.return_12m,
            return_1m: fund.return_1m,
            return_3m: fund.return_3m,
            return_6m: fund.return_6m,
            fund_name: fund.fund_name,
            fund_upfront_fee: fund.fund_upfront_fee,
            fund_company: fund.fund_company,
            fund_fee_rate: fund.fund_fee_rate,
            fund_grade: fund.fund_grade,
            fund_type: fund.fund_type,
            fund_risk_type: fund.fund_risk_type,
          }));

          setFunds(cleanedFunds);
        },
      });
    } catch (error) {
      console.error("❌ CSV 불러오기 실패:", error);
    }
  };

  const saveRegisteredFunds = async () => {
    try {
      await RefreshToken.post("/saveRegisteredFunds", funds);
      alert("펀드 목록이 저장되었습니다.");
    } catch (error) {
      console.error("❌ 저장 오류:", error);
      alert("펀드 목록 저장 중 오류 발생");
    }
  };

  useEffect(() => {
    fetchFundsFromCSV();
  }, []);

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
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveFund = async () => {
    try {
      await RefreshToken.post("/fundSave", formData);
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

  // 현재 페이지에 표시할 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage; // 현재 페이지의 마지막 항목 인덱스
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // 현재 페이지의 첫 번째 항목 인덱스
  const currentFunds = funds.slice(indexOfFirstItem, indexOfLastItem); // 현재 페이지에 표시할 데이터

  return (
    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>펀드 상품 등록</h2>
      <table className={styles.fundTable}>
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
                <button  className={styles.fundButton} onClick={() => handleOpenPopup(fund)}>등록</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className={style.pagination} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <button
          className={style.exListBtn}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} // 이전 페이지로 이동
          disabled={currentPage === 1}
        >
          ◀ 이전
        </button>
        <span>{currentPage} / {Math.ceil(funds.length / itemsPerPage)}</span> {/* 현재 페이지 / 총 페이지 */}
        <button
          className={style.exListBtn}
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(funds.length / itemsPerPage)))} // 다음 페이지로 이동
          disabled={currentPage === Math.ceil(funds.length / itemsPerPage)}
        >
          다음 ▶
        </button>
      </div>

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
                  <input type="text" name="fund_name" value={formData.fund_name} onChange={handleChange} required />
                </div>
                <div>
                  <label>운용사명:</label>
                  <input type="text" name="fund_company" value={formData.fund_company} onChange={handleChange} required />
                </div>
                <div>
                  <label>펀드 유형:</label>
                  <input type="text" name="fund_type" value={formData.fund_type} onChange={handleChange} />
                </div>
                <div>
                  <label>펀드 등급:</label>
                  <input type="number" name="fund_grade" value={formData.fund_grade} onChange={handleChange} min="1" max="10" />
                </div>
                <div>
                  <label>총보수 (%):</label>
                  <input type="number" name="fund_fee_rate" value={formData.fund_fee_rate} onChange={handleChange} step="0.01" />
                </div>
                <div>
                  <label>선취수수료:</label>
                  <input type="number" name="fund_upfront_fee" value={formData.fund_upfront_fee} onChange={handleChange} step="0.01" />
                </div>
                <div>
                  <label>1개월 수익률 (%):</label>
                  <input type="number" name="return_1m" value={formData.return_1m} onChange={handleChange} step="0.01" />
                </div>
                <div>
                  <label>3개월 수익률 (%):</label>
                  <input type="number" name="return_3m" value={formData.return_3m} onChange={handleChange} step="0.01" />
                </div>
                <div>
                  <label>6개월 수익률 (%):</label>
                  <input type="number" name="return_6m" value={formData.return_6m} onChange={handleChange} step="0.01" />
                </div>
                <div>
                  <label>12개월 수익률 (%):</label>
                  <input type="number" name="return_12m" value={formData.return_12m} onChange={handleChange} step="0.01" />
                </div>
                <div className={styles.actionbuttons}>
                  <button type="submit">저장</button>
                  <button type="button" onClick={handleClosePopup}>닫기</button>
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