// ✅ FundProductManage.js - 원래 구조 유지 + 검색 + 페이징 + 펀드 이름 readOnly 처리 반영
import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";

const FundProductManage = () => {
  const [fundList, setFundList] = useState([]);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const fundsPerPage = 10;

  useEffect(() => {
    fetchFundList();
  }, []);

  const fetchFundList = async () => {
    try {
      const res = await RefreshToken.get("/api/fundList");
      setFundList(res.data);
    } catch (error) {
      console.error("펀드 목록 조회 실패", error);
    }
  };

  const handleEditClick = (fund) => {
    setFormData(fund);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      await RefreshToken.put(`/api/fundUpdate/${formData.fund_id}`, formData);
      alert("수정되었습니다");
      fetchFundList();
    } catch (err) {
      alert("수정 실패");
    }
  };

  // 🔍 검색 필터링
  const filteredFunds = fundList.filter((fund) =>
    fund.fund_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📄 페이징 처리
  const indexOfLast = currentPage * fundsPerPage;
  const indexOfFirst = indexOfLast - fundsPerPage;
  const currentFunds = filteredFunds.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredFunds.length / fundsPerPage);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>펀드 상품 관리</h2>

      {/* 🔍 검색창 */}
      <input
        type="text"
        placeholder="펀드 이름 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      <table className={styles.table}>
        <thead>
          <tr>
            <th>펀드 이름</th>
            <th>등급</th>
            <th>선취수수료</th>
            <th>총보수</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          {currentFunds.map((fund) => (
            <tr key={fund.fund_id}>
              <td>{fund.fund_name}</td>
              <td>{fund.fund_grade}</td>
              <td>{fund.fund_upfront_fee}</td>
              <td>{fund.fund_fee_rate}</td>
              <td>
                <button onClick={() => handleEditClick(fund)}>수정</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📄 페이징 버튼 */}
      <div className={styles.pagination}>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx + 1}
            onClick={() => setCurrentPage(idx + 1)}
            className={currentPage === idx + 1 ? styles.activePage : ""}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* ✏️ 수정 폼 */}
      {formData.fund_id && (
        <div className={styles.editForm}>
          <h3>펀드 정보 수정</h3>
          <div>
            <label>펀드 이름:</label>
            <input
              type="text"
              name="fund_name"
              value={formData.fund_name}
              onChange={handleChange}
              readOnly // ✅ 이름은 수정 불가
            />
          </div>
          <div>
            <label>등급:</label>
            <input
              type="number"
              name="fund_grade"
              value={formData.fund_grade}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>선취수수료(%):</label>
            <input
              type="number"
              name="fund_upfront_fee"
              value={formData.fund_upfront_fee}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>총보수(%):</label>
            <input
              type="number"
              name="fund_fee_rate"
              value={formData.fund_fee_rate}
              onChange={handleChange}
            />
          </div>
          <button onClick={handleUpdate}>저장</button>
        </div>
      )}
    </div>
  );
};

export default FundProductManage;
