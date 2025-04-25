import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/LoanInterestList.css";

const LoanInterestList = () => {
  const [interestList, setInterestList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? "active" : ""}
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
