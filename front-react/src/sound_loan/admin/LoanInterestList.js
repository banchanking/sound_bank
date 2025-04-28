import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/LoanInterestList.css";

const LoanInterestList = () => {
  const [interestList, setInterestList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageGroup, setPageGroup] = useState(1);
  const pageGroupSize = 10;
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    const date = new Date(timestamp);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };
  useEffect(() => {
    RefreshToken.get("/admin/loanInterestList")
      .then((res) => {
        setInterestList(res.data);
        setFilteredList(res.data);
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
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // 페이지 그룹 처리 로직
  const startPage = (pageGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // ◀ 버튼 클릭시 이전 그룹 이동
  const handlePrevGroup = () => {
    if (pageGroup > 1) {
      setPageGroup(pageGroup - 1);
      setCurrentPage((pageGroup - 2) * pageGroupSize + 1);
    }
  };

  // ▶ 버튼 클릭시 다음 그룹 이동
  const handleNextGroup = () => {
    if (endPage < totalPages) {
      setPageGroup(pageGroup + 1);
      setCurrentPage(pageGroup * pageGroupSize + 1);
    }
  };

  return (
    <div className="interestContainer">
      <h2 className="interestTitle">📄 전체 이자 납입 내역</h2>

      <div className="interestSearch">
        <input
          type="text"
          placeholder="고객ID 또는 대출ID로 검색"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button onClick={handleSearchClick}>검색</button>
      </div>

      {currentItems.length > 0 ? (
        <table className="interestTable">
          <thead>
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
          <tbody>
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
        <p className="interestEmpty">이자 납입 내역이 존재하지 않습니다.</p>
      )}

      {totalPages > 1 && (
        <div className="interestPagination">
          {/* ◀ 그룹 이동 */}
          {startPage > 1 && (
            <button onClick={handlePrevGroup} className="groupButton">
              ◀
            </button>
          )}

          {/* 현재 그룹 페이지 번호 표시 */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? "active" : ""}
            >
              {page}
            </button>
          ))}

          {/* ▶ 그룹 이동 */}
          {endPage < totalPages && (
            <button onClick={handleNextGroup} className="groupButton">
              ▶
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default LoanInterestList;
