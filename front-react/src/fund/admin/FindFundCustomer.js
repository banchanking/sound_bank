import React, { useState, useEffect } from "react"; // React의 상태 관리와 생명주기 훅
import RefreshToken from "../../jwt/RefreshToken"; // 인증 토큰 갱신을 위한 Axios 인스턴스
import styles from "../../Css/fund/FundAdmin.module.css"; // CSS 모듈 스타일링

const FindFundCustomer = () => {
  // 상태 관리
  const [transactions, setTransactions] = useState([]); // 거래 목록 상태
  const [search, setSearch] = useState(""); // 검색어 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const itemsPerPage = 10; // 페이지당 표시할 항목 수

  // 거래 목록 조회 함수
  const fetchPendingTransactions = async () => {
    console.log("fetchPendingTransactions 호출됨"); // 함수 호출 여부 확인
    try {
      // API 호출: 대기 중인 거래 목록 가져오기
      const res = await RefreshToken.get("/pending-check");
      console.log("API 응답 데이터:", res.data); // 응답 데이터 출력
      setTransactions(Array.isArray(res.data) ? res.data : []); // 응답 데이터가 배열인지 확인 후 상태 업데이트
    } catch (error) {
      console.error("조회 실패", error); // API 호출 실패 시 오류 출력
      alert("거래 목록 조회 중 오류가 발생했습니다."); // 사용자에게 오류 알림
    }
  };

  // 승인/거절 처리 함수
  const updateStatus = async (fundTransactionId, status) => {
    try {
      // API 호출: 거래 상태 업데이트
      await RefreshToken.put(`/fundTrade/${fundTransactionId}/${status.toLowerCase()}`);
      alert(`${status === "APPROVED" ? "승인" : "거절"} 처리 완료`); // 처리 결과 알림
      fetchPendingTransactions(); // 상태 업데이트 후 목록 갱신
    } catch (err) {
      console.error("처리 실패", err); // API 호출 실패 시 오류 출력

      // 에러 메시지를 사용자에게 표시
      if (err.response && err.response.data) {
        alert(`처리 실패: ${err.response.data}`); // 서버에서 반환된 에러 메시지 표시
      } else {
        alert("처리 중 오류가 발생했습니다."); // 일반적인 오류 메시지
      }
    }
  };

  // 검색 필터링
  const filteredTransactions = transactions.filter(
    (tx) =>
      (tx.customerId?.toString().toLowerCase().includes(search.toLowerCase()) || // 고객 ID 검색
      tx.fundId?.toString().toLowerCase().includes(search.toLowerCase())) // 펀드 ID 검색
  );

  // 현재 페이지에 표시할 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage; // 현재 페이지의 마지막 항목 인덱스
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // 현재 페이지의 첫 번째 항목 인덱스
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem); // 현재 페이지에 표시할 데이터

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); // 현재 페이지 업데이트
  };

  // 컴포넌트가 렌더링될 때 거래 목록 조회
  useEffect(() => {
    fetchPendingTransactions(); // 초기 데이터 로드
  }, []); // 빈 배열을 전달하여 컴포넌트가 처음 렌더링될 때만 실행

  return (
    <div className={styles.fundContainer}>
      {/* 페이지 제목 */}
      <h2 className={styles.fundTitle}>펀드 거래 승인 요청</h2>

      {/* 검색 입력창 */}
      <input
        type="text"
        className={styles.searchInput}
        placeholder="고객 ID 또는 펀드 ID 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)} // 검색어 업데이트
      />

      {/* 거래 목록 테이블 */}
      <table className={styles.fundTable}>
        <thead>
          <tr>
            <th>거래ID</th>
            <th>고객 ID</th>
            <th>펀드 ID</th>
            <th>투자 금액</th>
            <th>좌수</th>
            <th>신청일</th>
            <th>거래유형</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {/* 거래 목록 렌더링 */}
          {currentTransactions.length > 0 ? (
            currentTransactions.map((tx) => {
              console.log("거래 데이터:", tx); // 각 거래 데이터 확인
              return (
                <tr key={tx.fundTransactionId} className={styles.fundRow}>
                  <td>{tx.fundTransactionId}</td> {/* 거래 ID */}
                  <td>{tx.customerId}</td> {/* 고객 ID */}
                  <td>{tx.fundId}</td> {/* 펀드 ID */}
                  <td>{tx.fundInvestAmount?.toLocaleString()}</td> {/* 투자 금액 */}
                  <td>{tx.fundUnitsPurchased}</td> {/* 좌수 */}
                  <td>{tx.fundTransactionDate}</td> {/* 신청일 */}
                  <td>{tx.fundTransactionType}</td> {/* 거래 유형 */}
                  <td>{tx.status}</td> {/* 상태 */}
                  <td>
                    {/* 승인 버튼 */}
                    <button
                      className={styles.fundApproveBtn}
                      onClick={() => updateStatus(tx.fundTransactionId, "APPROVED")}
                    >
                      승인
                    </button>
                    {/* 거절 버튼 */}
                    <button
                      className={styles.fundRejectBtn}
                      onClick={() => updateStatus(tx.fundTransactionId, "REJECTED")}
                    >
                      거절
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            // 거래 목록이 없을 경우 메시지 표시
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                거래 내역이 없습니다.
              </td>
            </tr>
          )}
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
        {Array.from({ length: Math.ceil(filteredTransactions.length / itemsPerPage) }, (_, i) => (
          <span
            key={i + 1}
            className={currentPage === i + 1 ? styles.activePage : ""}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </span>
        ))}
        <span
          onClick={() => handlePageChange(Math.min(currentPage + 1, Math.ceil(filteredTransactions.length / itemsPerPage)))} // 다음 페이지로 이동
          style={{
            cursor: currentPage === Math.ceil(filteredTransactions.length / itemsPerPage) ? "not-allowed" : "pointer",
            color: currentPage === Math.ceil(filteredTransactions.length / itemsPerPage) ? "#ccc" : "#007bff",
          }}
        >
          {">"}
        </span>
        <span
          onClick={() => handlePageChange(Math.ceil(filteredTransactions.length / itemsPerPage))} // 마지막 페이지로 이동
          style={{
            cursor: currentPage === Math.ceil(filteredTransactions.length / itemsPerPage) ? "not-allowed" : "pointer",
            color: currentPage === Math.ceil(filteredTransactions.length / itemsPerPage) ? "#ccc" : "#007bff",
          }}
        >
          {">>"}
        </span>
      </div>
    </div>
  );
};

export default FindFundCustomer;