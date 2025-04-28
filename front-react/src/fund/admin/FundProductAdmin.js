// ✅ FundProductAdmin.js - 네 원래 구조 기준 + Set비교 + 검색기능 + 에러없이 최종

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import styles from "../../Css/fund/FundAdmin.module.css";
import style from "../../Css/exchange/ExList.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const FundProductAdmin = () => {
  const [funds, setFunds] = useState([]); // CSV 전체 펀드
  const [registeredFundSet, setRegisteredFundSet] = useState(new Set()); // 등록된 펀드 Set
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
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  // ✅ 등록된 펀드 목록 가져오기
  const fetchRegisteredFunds = async () => {
    try {
      const response = await RefreshToken.get("/registeredFunds");
      const names = response.data.map(f => f.fund_name?.trim().toLowerCase());
      setRegisteredFundSet(new Set(names));
    } catch (error) {
      console.error("❌ 등록된 펀드 목록 조회 실패:", error);
    }
  };

  // ✅ CSV 파일 불러오기
  const fetchFundsFromCSV = async () => {
    try {
      const response = await fetch("/data/fundList.csv");
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedFunds = results.data.map(fund => ({
            fund_name: fund.fund_name?.trim(),
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
          setFunds(parsedFunds);
        },
      });
    } catch (error) {
      console.error("❌ CSV 불러오기 실패:", error);
    }
  };

  // ✅ 전체 데이터 로딩
  const fetchData = async () => {
    await fetchRegisteredFunds();
    await fetchFundsFromCSV();
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ 검색 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // ✅ 팝업 열기
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

  // ✅ 팝업 닫기
  const handleClosePopup = () => {
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
    setIsPopupOpen(false);
  };

  // ✅ input 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ 등록 저장
  const handleSaveFund = async () => {
    try {
      await RefreshToken.post("/fundSave", formData);
      alert("펀드상품 등록 성공!");
      await fetchData();
      handleClosePopup();
    } catch (error) {
      console.error("❌ 펀드 저장 실패:", error);
      alert("펀드 등록 실패");
    }
  };

  // ✅ 검색 필터 적용
  const filteredFunds = funds.filter(fund =>
    fund.fund_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ 페이지네이션 적용
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFunds = filteredFunds.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>펀드 상품 등록</h2>

      {/* 검색창 */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="펀드명을 검색하세요"
          value={searchTerm}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      {/* 테이블 */}
      <table className={styles.fundInsertTable}>
        <thead>
          <tr>
            <th>펀드명</th>
            <th>운용사명</th>
            <th>펀드유형</th>
            <th>펀드등급</th>
            <th>총보수 (%)</th>
            <th>선취수수료 (%)</th>
            <th>1개월</th>
            <th>3개월</th>
            <th>6개월</th>
            <th>12개월</th>
            <th>선택</th>
          </tr>
        </thead>
        <tbody className={styles.fundTable}>
          {currentFunds.map((fund, index) => {
            const isRegistered = registeredFundSet.has(fund.fund_name?.trim().toLowerCase());
            return (
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
                  {isRegistered ? (
                    <button className={styles.disabledButton} disabled>등록됨</button>
                  ) : (
                    <button className={styles.fundButton} onClick={() => handleOpenPopup(fund)}>등록</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className={style.pagination} style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
        <button className={style.exListBtn} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>◀ 이전</button>
        <span>{currentPage} / {Math.ceil(filteredFunds.length / itemsPerPage)}</span>
        <button className={style.exListBtn} onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredFunds.length / itemsPerPage)))} disabled={currentPage === Math.ceil(filteredFunds.length / itemsPerPage)}>다음 ▶</button>
      </div>

      {/* 팝업 모달 */}
      {isPopupOpen && (
        <div className={styles.fundpopupOverlay}>
          <div className={styles.fundpopupModal}>
            <div className={styles.fundpopupHeader}>
              <h3>펀드 등록</h3>
              <button className={styles.closeButton} onClick={handleClosePopup}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveFund(); }}>
              <div><label>펀드 이름:</label><input type="text" name="fund_name" value={formData.fund_name} className={styles.rateInput} onChange={handleChange} /></div>
              <div><label>운용사명:</label><input type="text" name="fund_company" value={formData.fund_company} className={styles.rateInput} onChange={handleChange} /></div>
              <div><label>펀드 유형:</label><input type="text" name="fund_type" value={formData.fund_type} className={styles.rateInput} onChange={handleChange} /></div>
              <div><label>펀드 등급:</label><input type="number" name="fund_grade" value={formData.fund_grade} className={styles.feeInput} onChange={handleChange} /></div>
              <div><label>총보수 (%):</label><input type="number" name="fund_fee_rate" value={formData.fund_fee_rate} className={styles.feeInput} onChange={handleChange} /></div>
              <div><label>선취수수료 (%):</label><input type="number" name="fund_upfront_fee" value={formData.fund_upfront_fee} className={styles.feeInput} onChange={handleChange} /></div>
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
