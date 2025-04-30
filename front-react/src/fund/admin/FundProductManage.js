import React, { useState, useEffect } from "react";
import styles from "../../Css/fund/FundAdmin.module.css";
import style from "../../Css/exchange/ExList.module.css";
import RefreshToken from "../../jwt/RefreshToken";
import axios from "axios"; 

const ITEMS_PER_PAGE = 10;

const FundProductManage = () => {
  const [fundList, setFundList] = useState([]);
  const [formData, setFormData] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchFundList();
  }, []);

  const fetchFundList = async () => {
    try {
      const response = await RefreshToken.get("/fundList");
      setFundList(response.data);
    } catch (error) {
      console.error("펀드 목록 조회 실패:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenPopup = (fund) => {
    if (!fund || typeof fund !== 'object') {
      console.error("펀드 정보가 잘못되었습니다:", fund);
      alert("펀드 정보를 불러올 수 없습니다.");
      return;
    }
    setFormData({ ...fund });
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setFormData({});
    setIsPopupOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateFund = async () => {
    try {
      if (!formData.fund_id) {
        alert("펀드 ID가 없습니다. 업데이트할 수 없습니다.");
        return;
      }

      const predictResponse = await axios.post("http://127.0.0.1:8000/predict-fund-one", {
        fund_fee_rate: formData.fund_fee_rate,
        fund_upfront_fee: formData.fund_upfront_fee,
        fund_grade: formData.fund_grade,
        return_1m: formData.return_1m,
        return_3m: formData.return_3m,
        return_6m: formData.return_6m,
        return_12m: formData.return_12m,
      });

      const newRiskType = predictResponse.data.fund_risk_type;
      const updatedFormData = { ...formData, fund_risk_type: newRiskType };

      await RefreshToken.put(`/fundUpdate/${formData.fund_id}`, updatedFormData);

      alert("펀드 수정 완료!");
      handleClosePopup();
      fetchFundList();
    } catch (error) {
      console.error("펀드 수정 실패:", error);
      alert("펀드 수정 실패!");
    }
  };

  const handleDeleteFund = async (fundId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await RefreshToken.delete(`/fund/${fundId}`);
        alert("펀드 삭제 성공!");
        fetchFundList();
      } catch (error) {
        console.error("펀드 삭제 실패:", error);
        alert("펀드 삭제 실패!");
      }
    }
  };

  const filteredFunds = fundList.filter((fund) =>
    fund.fund_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentFunds = filteredFunds.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredFunds.length / ITEMS_PER_PAGE);

  return (
    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>펀드 상품 관리</h2>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="펀드명을 검색하세요"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>펀드명</th>
            <th>운용사</th>
            <th>펀드유형</th>
            <th>펀드등급</th>
            <th>총보수</th>
            <th>선취수수료</th>
            <th>성향상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {currentFunds.map((fund, idx) => (
            <tr key={`${fund.fund_id}-${idx}`}>
              <td>{fund.fund_name}</td>
              <td>{fund.fund_company}</td>
              <td>{fund.fund_type}</td>
              <td>{fund.fund_grade}</td>
              <td>{fund.fund_fee_rate}</td>
              <td>{fund.fund_upfront_fee}</td>
              <td>
                {fund.fund_risk_type ? (
                  fund.fund_risk_type
                ) : (
                  <span style={{ color: "red", fontWeight: "bold" }}>펀드 성향 없음</span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button className={styles.fundButton} onClick={() => handleOpenPopup(fund)}>수정</button>
                  <button className={styles.fundButton} style={{ backgroundColor: "#ab4f4f" }} onClick={() => handleDeleteFund(fund.fund_id)}>삭제</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={style.pagination} style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
        <button className={style.exListBtn} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>◀ 이전</button>
        <span>{currentPage} / {totalPages}</span>
        <button className={style.exListBtn} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>다음 ▶</button>
      </div>

      {isPopupOpen && (
        <div className={styles.fundpopupOverlay}>
          <div className={styles.fundpopupModal}>
            <div className={styles.fundpopupHeader}>
              <h3>펀드 수정</h3>
              <button className={styles.closeButton} onClick={handleClosePopup}>×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateFund(); }}>
              <div><label>펀드 이름:</label><input type="text" name="fund_name" value={formData.fund_name || ""} className={styles.rateInput} disabled /></div>
              <div><label>운용사명:</label><input type="text" name="fund_company" value={formData.fund_company || ""} onChange={handleChange} className={styles.rateInput} /></div>
              <div><label>펀드 유형:</label>
                <select name="fund_type" value={formData.fund_type || ""} onChange={handleChange} className={styles.rateInput}>
                  <option value="">선택</option>
                  <option value="주식형">주식형</option>
                  <option value="채권형">채권형</option>
                  <option value="혼합형">혼합형</option>
                  <option value="부동산형">부동산형</option>
                  <option value="특별자산형">특별자산형</option>
                  <option value="파생형">파생형</option>
                  <option value="기타형">기타형</option>
                </select>
              </div>
              <div><label>펀드 등급:</label><input type="number" name="fund_grade" value={formData.fund_grade || ""} onChange={handleChange} className={styles.rateInput} /></div>
              <div><label>총보수 (%):</label><input type="number" name="fund_fee_rate" value={formData.fund_fee_rate || ""} onChange={handleChange} step="0.01" className={styles.feeInput} /></div>
              <div><label>선취수수료 (%):</label><input type="number" name="fund_upfront_fee" value={formData.fund_upfront_fee || ""} onChange={handleChange} step="0.01" className={styles.feeInput} /></div>
              <div><label>펀드 성향:</label><input type="text" name="fund_risk_type" value={formData.fund_risk_type || ""} readOnly className={styles.rateInput} style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }} /></div>
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

export default FundProductManage;