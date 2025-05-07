import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import Papa from "papaparse"; // CSV 파싱 라이브러리
import styles from "../../Css/fund/FundAdmin.module.css";
import style from "../../Css/exchange/ExList.module.css"; // 새로운 스타일 파일

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
  
  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // 날짜가 없을 경우
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

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
    const rate = fund.return_12m / 100; // 퍼센트 값을 소수로 변환
    const currentValue = units * price * (1 + rate); // 현재가 계산
    console.log("현재가 계산:", { fundName, units, price, rate, currentValue });
    return currentValue;
  };
  
  // 수익률 계산 함수
  const calculateReturnRate = (price, current) => {
    if (!price || !current || price <= 0) {
      console.error("Invalid input for calculateReturnRate:", { price, current });
      return "-"; // 값이 없거나 단가가 0 이하인 경우
    }
    const rate = (current - price) / price; // 수익률 계산
    console.log("수익률 계산:", { price, current, rate });
    return rate.toFixed(2) + "%"; // 소수점 2자리까지 표시 후 % 추가
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
            <th>투자금액 (원화)</th>
            <th>단가 (원화)</th>
            <th>좌수</th>
            <th>현재가 (원화)</th>
            <th>수익률 (%)</th>
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

            return (
              <tr key={tx.fundTransactionId}>
                <td>{tx.customerId}</td>
                <td>{tx.fund_name}</td>
                <td>{formatDate(tx.fundTransactionDate)}</td>
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
      <div
        className={style.pagination}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button
          className={style.exListBtn}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} // 이전 페이지로 이동
          disabled={currentPage === 1}
        >
          ◀ 이전
        </button>
        <span>
          {currentPage} / {Math.ceil(filtered.length / itemsPerPage)}
        </span>{" "}
        {/* 현재 페이지 / 총 페이지 */}
        <button
          className={style.exListBtn}
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(filtered.length / itemsPerPage))
            )
          } // 다음 페이지로 이동
          disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
};

export default CustomerTransHistory;