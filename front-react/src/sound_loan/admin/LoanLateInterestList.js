import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/LoanLateInterestList.css";

const LoanLateInterestList = () => {
  const [lateList, setLateList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  useEffect(() => {
    RefreshToken.get("/admin/loanLateInterestList")
      .then((res) => {
        setLateList(res.data);
        setFilteredList(res.data);
      })
      .catch((err) => {
        console.error("연체 이자 내역 불러오기 실패:", err);
        alert("연체 이자 내역 조회 중 오류가 발생했습니다.");
      });
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClick = () => {
    const lowerTerm = searchTerm.toLowerCase();
    const newList = lateList.filter(
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
    <div className="lateInterestContainer">
      <h2 className="lateInterestTitle">📄 전체 연체 이력 내역</h2>

      <div className="lateInterestSearch">
        <input
          type="text"
          placeholder="고객ID 또는 대출ID로 검색"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button onClick={handleSearchClick}>검색</button>
      </div>

      {currentItems.length > 0 ? (
        <table className="lateInterestTable">
          <thead>
            <tr>
              <th>No</th>
              <th>연체번호</th>
              <th>고객ID</th>
              <th>대출ID</th>
              <th>미납 금액</th>
              <th>연체 이자</th>
              <th>납부 상태</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item.latePaymentNo}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{item.latePaymentNo}</td>
                <td>{item.customerId}</td>
                <td>{item.loanId}</td>
                <td>{item.unpaidAmount.toLocaleString("ko-KR")}원</td>
                <td>{item.overdueInterest.toLocaleString("ko-KR")}원</td>
                <td>{item.repaymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="lateInterestEmpty">연체 이자 내역이 존재하지 않습니다.</p>
      )}

      {totalPages > 1 && (
        <div className="lateInterestPagination">
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

export default LoanLateInterestList;
