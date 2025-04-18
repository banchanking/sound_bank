import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";

const LoanInterestList = () => {
  const [interestList, setInterestList] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 입력 중인 검색어
  const [filteredList, setFilteredList] = useState([]); // 실제 보여줄 리스트
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().split("T")[0]; // 'YYYY-MM-DD' 형식
  };

  useEffect(() => {
    RefreshToken.get("/admin/loanInterestList")
      .then((res) => {
        setInterestList(res.data);
        setFilteredList(res.data); // 초기엔 전체 보여줌
      })
      .catch((err) => {
        console.error("이자 납입 내역 불러오기 실패:", err);
        alert("이자 납입 내역 조회 중 오류가 발생했습니다.");
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    const lowerTerm = searchTerm.toLowerCase();
    const newList = interestList.filter(
      (item) =>
        item.customerId.toLowerCase().includes(lowerTerm) ||
        item.loanId.toString().includes(lowerTerm)
    );
    setFilteredList(newList);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="totalArea">
      <h2>📄 전체 이자 납입 내역</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="고객ID 또는 대출ID로 검색"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button onClick={handleSearchClick} style={{ marginLeft: "8px" }}>
          검색
        </button>
      </div>

      {currentItems.length > 0 ? (
        <table className="tableArea">
          <thead className="theadArea">
            <tr>
              <th>No</th>
              <th>납입번호</th>
              <th>고객ID</th>
              <th>대출ID</th>
              <th>회차</th>
              <th>이자금</th>
              <th>원금</th>
              <th>총 납입액</th>
              <th>납부상태</th>
              <th>예정일</th>
              <th>납부일</th>
            </tr>
          </thead>
          <tbody className="tbodyArea">
            {currentItems.map((item, index) => (
              <tr key={item.interestPaymentNo}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{item.interestPaymentNo}</td>
                <td>{item.customerId}</td>
                <td>{item.loanId}</td>
                <td>{item.repaymentTerm}</td>
                <td>{item.interestAmount.toLocaleString("ko-KR")}원</td>
                <td>{item.principalAmount.toLocaleString("ko-KR")}원</td>
                <td>{item.repaymentAmount.toLocaleString("ko-KR")}원</td>
                <td>{item.repaymentStatus}</td>
                <td>{formatDate(item.repaymentDate)}</td>
                <td>{formatDate(item.actualRepaymentDate) || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>이자 납입 내역이 존재하지 않습니다.</p>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div style={{ marginTop: "10px" }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                margin: "2px",
                fontWeight: currentPage === page ? "bold" : "normal",
              }}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanInterestList;
