import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAdmin.module.css";

const CustomerTransHistory = () => {
  const [transactions, setTransactions] = useState([]); // 전체 거래 내역 상태
  const [search, setSearch] = useState(""); // 검색어 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const itemsPerPage = 10; // 페이지당 표시할 항목 수

  // 거래 내역 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await RefreshToken.get("/admin/fundTrade/all");
        setTransactions(res.data); // 거래 내역 상태 업데이트
      } catch (err) {
        console.error("전체 거래내역 불러오기 실패", err);
      }
    };
    fetchData();
  }, []);

  // 수익률 계산 함수
  const calculateReturnRate = (price, current) => {
    if (!price || !current) return "-";
    const rate = ((current - price) / price) * 100;
    return rate.toFixed(2) + "%";
  };

  // 검색 필터링
  const filtered = transactions.filter(
    (tx) =>
      tx.customerId?.toLowerCase().includes(search.toLowerCase()) || // 고객 ID 검색
      tx.fund_name?.toLowerCase().includes(search.toLowerCase()) // 펀드명 검색
  );

  // 현재 페이지에 표시할 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage; // 현재 페이지의 마지막 항목 인덱스
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // 현재 페이지의 첫 번째 항목 인덱스
  const currentTransactions = filtered.slice(indexOfFirstItem, indexOfLastItem); // 현재 페이지에 표시할 데이터

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // 현재 페이지 업데이트
  };

  return (
    <div className={styles.fundContainer}>
      <h2 className={styles.fundTitle}>SoundBank 고객 펀드 거래내역</h2>

      {/* 검색 입력창 */}
      <input
        type="text"
        className={styles.searchInput}
        placeholder="고객 ID 또는 펀드명 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)} // 검색어 업데이트
      />

      {/* 거래 내역 테이블 */}
      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>고객ID</th>
            <th>펀드명</th>
            <th>거래일</th>
            <th>거래유형</th>
            <th>투자금액</th>
            <th>단가</th>
            <th>좌수</th>
            <th>현재가</th>
            <th>수익률</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.map((tx) => (
            <tr key={tx.fundTransactionId}>
              <td>{tx.customerId}</td>
              <td>{tx.fund_name}</td>
              <td>{tx.fundTransactionDate}</td>
              <td>{tx.fundTransactionType}</td>
              <td>{tx.fundInvestAmount?.toLocaleString()}</td>
              <td>{tx.fundPricePerUnit}</td>
              <td>{tx.fundUnitsPurchased}</td>
              <td>{tx.fundCurrentValue}</td>
              <td>{calculateReturnRate(tx.fundPricePerUnit, tx.fundCurrentValue)}</td>
              <td>{tx.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className={styles.fundpagination}>
        <span
          onClick={() => handlePageChange(1)} // 첫 페이지로 이동
          style={{
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            color: currentPage === 1 ? "#ccc" : "#007bff",
          }}
        >
          {"<<"}
        </span>
        <span
          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))} // 이전 페이지로 이동
          style={{
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            color: currentPage === 1 ? "#ccc" : "#007bff",
          }}
        >
          {"<"}
        </span>
        {Array.from({ length: Math.ceil(filtered.length / itemsPerPage) }, (_, i) => (
          <span
            key={i + 1}
            className={currentPage === i + 1 ? styles.activePage : ""}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </span>
        ))}
        <span
          onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(filtered.length / itemsPerPage)))} // 다음 페이지로 이동
          style={{
            cursor: currentPage === Math.ceil(filtered.length / itemsPerPage) ? "not-allowed" : "pointer",
            color: currentPage === Math.ceil(filtered.length / itemsPerPage) ? "#ccc" : "#007bff",
          }}
        >
          {">"}
        </span>
        <span
          onClick={() => handlePageChange(Math.ceil(filtered.length / itemsPerPage))} // 마지막 페이지로 이동
          style={{
            cursor: currentPage === Math.ceil(filtered.length / itemsPerPage) ? "not-allowed" : "pointer",
            color: currentPage === Math.ceil(filtered.length / itemsPerPage) ? "#ccc" : "#007bff",
          }}
        >
          {">>"}
        </span>
      </div>
    </div>
  );
};

export default CustomerTransHistory;