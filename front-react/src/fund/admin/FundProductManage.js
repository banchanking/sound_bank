import React, { useState, useEffect } from "react";
import styles from "../../Css/fund/FundAdmin.module.css";
import style from "../../Css/exchange/ExList.module.css";
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

  // 📌 펀드 목록 조회
  const fetchFundList = async () => {
    try {
      const response = await RefreshToken.get("/fundList");
      setFundList(response.data);
    } catch (error) {
      console.error("펀드 목록 조회 실패:", error);
    }
  };

  // 📌 검색 입력 핸들러 (이거 추가!!)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 📌 수정 팝업 열기
  const handleOpenPopup = (fund) => {
    if (!fund || typeof fund !== 'object') {
      console.error("펀드 정보가 잘못되었습니다:", fund);
      alert("펀드 정보를 불러올 수 없습니다.");
      return;
    }
    setFormData({ ...fund });
    setIsPopupOpen(true);
  };

  // 📌 수정 팝업 닫기
  const handleClosePopup = () => {
    setFormData({});
    setIsPopupOpen(false);
  };

  // 📌 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 📌 펀드 수정 요청
  const handleUpdateFund = async () => {
    try {
      if (!formData.fund_id) {
        alert("펀드 ID가 없습니다. 업데이트할 수 없습니다.");
        return;
      }

      const predictResponse = await RefreshToken.post("http://127.0.0.1:8000/predict-fund-one", {
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

  // 📌 펀드 삭제 요청
  const handleDeleteFund = async (fundId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await RefreshToken.delete(`/fundDelete/${fundId}`);
        alert("펀드 삭제 성공!");
        fetchFundList();
      } catch (error) {
        console.error("펀드 삭제 실패:", error);
        alert("펀드 삭제 실패!");
      }
    }
  };

  // 📌 검색 및 페이징 처리
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

      {/* 검색창 */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="펀드명을 검색하세요"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* 펀드 목록 테이블 */}
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
            <th>선택</th>
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
                <button
                  className={styles.fundButton}
                  onClick={() => handleOpenPopup(fund)}
                >
                  수정
                </button>
                <button
                  className={styles.fundButton}
                  style={{ backgroundColor: "#ab4f4f" }}
                  onClick={() => handleDeleteFund(fund.fund_id)}
                >
                  삭제
                </button>
              </div>
            </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이징 */}
      <div className={style.pagination} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <button className={style.exListBtn} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>◀ 이전</button>
        <span>{currentPage} / {totalPages}</span>
        <button className={style.exListBtn} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>다음 ▶</button>
      </div>

      {/* 수정 팝업 */}
      {isPopupOpen && (
        <div className={styles.fundpopupOverlay}>
          <div className={styles.fundpopupModal}>
            <div className={styles.popupHeader}>
              <h3>펀드 수정</h3>
              <span className={styles.closeButton} onClick={handleClosePopup}>×</span>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateFund(); }}>
              {/* 기존 input 들 그대로 유지 */}
              {/* 생략 가능: 너 소스 복붙하면 돼 */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundProductManage;
