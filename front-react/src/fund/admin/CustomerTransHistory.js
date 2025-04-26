import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import Papa from "papaparse"; // CSV 파싱 라이브러리
import styles from "../../Css/fund/FundAdmin.module.css";

const CustomerTransHistory = () => {
  const [transactions, setTransactions] = useState([]); // 전체 거래 내역 상태
  const [fundRates, setFundRates] = useState({}); // 펀드 수익률 데이터
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

  // 펀드 수익률 데이터 가져오기
  useEffect(() => {
    Papa.parse("/data/fundList_updated.csv", {
      header: true,
      download: true,
      complete: (results) => {
        const map = {};
        results.data.forEach((row) => {
          const name = row.fund_name?.trim();
          if (name) {
            map[name] = {
              return_1m: parseFloat(row.return_1m || 0), // 그대로 사용
              return_3m: parseFloat(row.return_3m || 0), // 그대로 사용
              return_6m: parseFloat(row.return_6m || 0), // 그대로 사용
              return_12m: parseFloat(row.return_12m || 0), // 그대로 사용
            };
          }
        });
        setFundRates(map);
      },
    });
  }, []);

  // 현재가 계산 함수
  const calculateCurrentValue = (fundName, units, price) => {
    if (!fundName || !units || !price) {
      console.error("Invalid input for calculateCurrentValue:", { fundName, units, price });
      return 0;
    }
  
    const fund = fundRates[fundName?.trim()];
    if (!fund) {
      console.error("No fund data found for:", fundName);
      return 0;
    }
  
    // 12개월 수익률 기준으로 현재가 계산
    const rate = parseFloat((fund.return_12m / 100).toFixed(2)); // 소수점 둘째자리로 반올림
    const currentValue = units * price * (1 + rate);
    console.log("현재가 계산:", { fundName, units, price, rate, currentValue });
    return currentValue;
  };

  // 수익률 계산 함수
  const calculateReturnRate = (price, current) => {
    if (!price || !current || price <= 0) {
      console.error("Invalid input for calculateReturnRate:", { price, current });
      return "-"; // 값이 없거나 단가가 0 이하인 경우
    }
    const rate = ((current - price) / price) * 100;
    console.log("수익률 계산:", { price, current, rate });
    return rate.toFixed(2) + "%"; // 소수점 2자리까지 표시
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
          {currentTransactions.map((tx) => {
            const currentValue = calculateCurrentValue(
              tx.fund_name,
              tx.fundUnitsPurchased,
              tx.fundPricePerUnit
            );
            const returnRate = calculateReturnRate(tx.fundPricePerUnit, currentValue);

            console.log("거래 데이터:", {
              fund_name: tx.fund_name,
              units: tx.fundUnitsPurchased,
              price: tx.fundPricePerUnit,
              currentValue,
              returnRate,
            });

            return (
              <tr key={tx.fundTransactionId}>
                <td>{tx.customerId}</td>
                <td>{tx.fund_name}</td>
                <td>{tx.fundTransactionDate}</td>
                <td>{tx.fundTransactionType}</td>
                <td>{tx.fundInvestAmount?.toLocaleString()}</td>
                <td>{tx.fundPricePerUnit?.toLocaleString()}</td>
                <td>{tx.fundUnitsPurchased}</td>
                <td>{currentValue?.toLocaleString()}</td> {/* 현재가 */}
                <td>{returnRate}</td> {/* 수익률 */}
                <td>{tx.status}</td>
              </tr>
            );
          })}
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