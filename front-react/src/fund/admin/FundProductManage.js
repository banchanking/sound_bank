// ✅ 최종 수정본 FundProductManage.js (styles = FundAdmin.module.css / style = ExList.module.css)
import React, { useState, useEffect } from "react";
import styles from "../../Css/fund/FundAdmin.module.css"; // ✅ 목록 스타일
import style from "../../Css/exchange/ExList.module.css"; // ✅ 페이징 버튼 스타일
import RefreshToken from "../../jwt/RefreshToken";

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

  // ✅ 펀드 목록 조회
  const fetchFundList = async () => {
    try {
      const response = await RefreshToken.get("/fundList");
      setFundList(response.data);
    } catch (error) {
      console.error("펀드 목록 조회 실패:", error);
    }
  };

  // ✅ 수정 팝업 열기
  const handleOpenPopup = (fund) => {
    if (!fund || typeof fund !== 'object') {
      console.error("펀드 정보가 잘못되었습니다:", fund);
      alert("펀드 정보를 불러올 수 없습니다.");
      return;
    }
    setFormData({ ...fund });
    setIsPopupOpen(true);
  };

  // ✅ 수정 팝업 닫기
  const handleClosePopup = () => {
    setFormData({});
    setIsPopupOpen(false);
  };

  // ✅ 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ 빈 값을 보완하는 함수
  const cleanFormData = (data) => {
    const cleaned = { ...data };
    if (cleaned.return_1m === "" || cleaned.return_1m == null) cleaned.return_1m = 0;
    if (cleaned.return_3m === "" || cleaned.return_3m == null) cleaned.return_3m = 0;
    if (cleaned.return_6m === "" || cleaned.return_6m == null) cleaned.return_6m = 0;
    if (cleaned.return_12m === "" || cleaned.return_12m == null) cleaned.return_12m = 0;
    if (cleaned.fund_risk_type === "" || cleaned.fund_risk_type == null) cleaned.fund_risk_type = "미지정";
    return cleaned;
  };

  // ✅ 펀드 수정 요청
  const handleUpdateFund = async () => {
    try {
      if (!formData.fund_id) {
        alert("펀드 ID가 없습니다. 업데이트할 수 없습니다.");
        return;
      }
      const cleanedFormData = cleanFormData(formData);
      await RefreshToken.put(`/fundUpdate/${formData.fund_id}`, cleanedFormData);
      alert("펀드 수정 완료!");
      handleClosePopup();
      fetchFundList();
    } catch (error) {
      console.error("펀드 수정 실패:", error);
      alert("펀드 수정 실패!");
    }
  };

  // ✅ 검색창 입력
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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

      {/* ✅ 펀드 목록 테이블 */}
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
            <th>수정</th>
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
                  <span style={{ color: "red", fontWeight: "bold" }}>펀드 성향 예측 필요</span>
                )}
              </td>
              <td>
                <button className={styles.fundButton} onClick={() => handleOpenPopup(fund)}>수정</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ 페이징 */}
      <div className={style.pagination} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <button className={style.exListBtn} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>◀ 이전</button>
        <span>{currentPage} / {totalPages}</span>
        <button className={style.exListBtn} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>다음 ▶</button>
      </div>

      {/* ✅ 수정 팝업 */}
      {isPopupOpen && (
        <div className={styles.fundpopupOverlay}>
          <div className={styles.fundpopupModal}>
            <div className={styles.popupHeader}>
              <h3>펀드 수정</h3>
              <span className={styles.closeButton} onClick={handleClosePopup}>&times;</span>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateFund(); }}>
              <div>
                <label>펀드 이름:</label>
                <input type="text" name="fund_name" value={formData.fund_name || ""} disabled />
              </div>
              <div>
                <label>운용사명:</label>
                <input type="text" name="fund_company" value={formData.fund_company || ""} onChange={handleChange} />
              </div>
              <div>
                <label>펀드 유형:</label>
                <select name="fund_type" value={formData.fund_type || ""} onChange={handleChange}>
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
              {/* ✅ 여기에 readonly 펀드성향 표시 */}
              <div>
                <label>펀드 성향:</label>
                <input type="text" name="fund_risk_type" value={formData.fund_risk_type || ""} readOnly style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }} />
                <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>※ 펀드 성향은 AI가 예측합니다.</p>
              </div>
              <div>
                <label>펀드 등급:</label>
                <select name="fund_grade" value={formData.fund_grade || ""} onChange={handleChange}>
                  <option value="">선택</option>
                  <option value="1">1등급</option>
                  <option value="2">2등급</option>
                  <option value="3">3등급</option>
                  <option value="4">4등급</option>
                  <option value="5">5등급</option>
                </select>
              </div>
              <div>
                <label>총보수 (%):</label>
                <input className={styles.rateInput} type="number" name="fund_fee_rate" value={formData.fund_fee_rate || ""} onChange={handleChange} step="0.01" />
              </div>
              <div>
                <label>선취수수료 (%):</label>
                <input className={styles.feeInput} ype="number" name="fund_upfront_fee" value={formData.fund_upfront_fee || ""} onChange={handleChange} step="0.01" />
              </div>
              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <button type="submit" className={styles.manageEditButton}>저장</button>
                <button type="button" onClick={handleClosePopup} className={styles.manageEditButton2}>닫기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundProductManage;
