// ✅ 수정된 FundProductManage.js (CSV 실제 fund_type 반영 + 수동 수정 구조)
import React, { useState, useEffect } from "react";
import styles from "../../Css/fund/FundAdmin.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const FundProductManage = () => {
  const [fundList, setFundList] = useState([]);
  const [formData, setFormData] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  const handleOpenPopup = (fund) => {
    setFormData(fund);
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
      await RefreshToken.put(`/fundUpdate/${formData.fund_id}`, formData);
      alert("펀드 수정 완료!");
      setIsPopupOpen(false);
      fetchFundList();
    } catch (error) {
      console.error("펀드 수정 실패:", error);
      alert("펀드 수정 실패!");
    }
  };

  // CSV 실제 유형값 기반 드롭다운 (대체투자형 제거)
  const fundTypeOptions = ["주식형", "채권형", "혼합형", "부동산형", "기타형"];

  return (
    <div className={styles.fundContainer}>
      <h2>펀드 상품 관리</h2>
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
          {fundList.map((fund, idx) => (
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
                <button onClick={() => handleOpenPopup(fund)}>수정</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isPopupOpen && (
        <div className={styles.fundpopupOverlay}>
          <div className={styles.fundpopupModal}>
            <div className={styles.popupHeader}>
              <h3>펀드 수정</h3>
              <span className={styles.closeButton} onClick={handleClosePopup}>
                &times;
              </span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateFund();
              }}
            >
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
                  {fundTypeOptions.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>펀드 등급:</label>
                <select name="fund_grade" value={formData.fund_grade || ""} onChange={handleChange}>
                  <option value="">선택</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}등급</option>
                  ))}
                </select>
              </div>
              <div>
                <label>총보수 (%):</label>
                <input type="number" name="fund_fee_rate" value={formData.fund_fee_rate || ""} onChange={handleChange} step="0.01" />
              </div>
              <div>
                <label>선취수수료 (%):</label>
                <input type="number" name="fund_upfront_fee" value={formData.fund_upfront_fee || ""} onChange={handleChange} step="0.01" />
              </div>
              <div className={styles.actionbuttons}>
                <button type="submit">저장</button>
                <button type="button" onClick={handleClosePopup}>닫기</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundProductManage;