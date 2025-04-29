import React, { useEffect, useState } from "react";
import "../../Css/loan/LoanCustomerList.css";
import RefreshToken from "../../jwt/RefreshToken";

const LoanCustomerList = () => {
  const [loanStatus, setLoanStatus] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [selectedProgress, setSelectedProgress] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    RefreshToken.get("/loanStatus")
      .then((res) => {
        setLoanStatus(res.data);
        setFilteredList(res.data);
      })
      .catch((error) => {
        console.error("데이터 가져오기 오류:", error);
      });
  };

  const handleSearch = () => {
    const filtered = loanStatus.filter((loan) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        loan.customerId.toLowerCase().includes(lowerSearchTerm) ||
        loan.loanProgress.toLowerCase().includes(lowerSearchTerm)
      );
    });
    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilteredList(loanStatus);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleSelect = (loanStatusNo) => {
    setSelectedLoans((prev) =>
      prev.includes(loanStatusNo)
        ? prev.filter((id) => id !== loanStatusNo)
        : [...prev, loanStatusNo]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = currentData
        .filter((loan) => loan.loanProgress === "신청")
        .map((loan) => loan.loanStatusNo);
      setSelectedLoans(allIds);
    } else {
      setSelectedLoans([]);
    }
  };

  const handleBulkSubmit = () => {
    if (!selectedProgress || selectedLoans.length === 0) {
      alert("대출 상태와 고객을 선택해주세요.");
      return;
    }

    Promise.all(
      selectedLoans.map((loanStatusNo) => {
        const loan = loanStatus.find(
          (item) => item.loanStatusNo === loanStatusNo
        );
        return RefreshToken.post(`/loanStatusUpdate/${loanStatusNo}`, {
          loan_progress: selectedProgress,
          customerId: loan.customerId,
        });
      })
    )
      .then(() => {
        alert("일괄 처리 완료!");
        setSelectedLoans([]);
        setSelectedProgress("");
        fetchData();
      })
      .catch(() => alert("처리 중 오류 발생"));
  };

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentData = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="loanCustomer-container">
      <h2 className="loanCustomer-title">📋 대출 가입 고객 목록</h2>

      <div className="loanCustomer-searchBar">
        <input
          type="text"
          placeholder="고객 아이디 / 대출진행상태"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>검색</button>
        <button onClick={handleReset}>전체목록</button>
      </div>

      <div className="loanCustomer-table-wrapper">
        <table className="loanCustomer-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    currentData.length > 0 &&
                    currentData.some((loan) => loan.loanProgress === "신청") &&
                    currentData
                      .filter((loan) => loan.loanProgress === "신청")
                      .every((loan) =>
                        selectedLoans.includes(loan.loanStatusNo)
                      )
                  }
                />
              </th>
              {[
                "no",
                "고객 아이디",
                "대출 상품명",
                "적용 금리",
                "대출 금액",
                "잔여 대출금",
                "총 상환횟수",
                "잔여 상환횟수",
                "상환 계좌번호",
                "고객 신용점수",
                "대출 상환방식",
                "대출금 상환일",
                "대출 유형",
                "대출 신청일",
                "대출 진행상황",
              ].map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((loan) => (
              <tr key={loan.loanStatusNo}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedLoans.includes(loan.loanStatusNo)}
                    onChange={() => handleSelect(loan.loanStatusNo)}
                    disabled={loan.loanProgress !== "신청"}
                  />
                </td>
                <td>{loan.loanStatusNo}</td>
                <td>{loan.customerId}</td>
                <td>{loan.loanName}</td>
                <td>연 {loan.interestRate}%</td>
                <td>{loan.loanAmount.toLocaleString("ko-KR")}</td>
                <td>{loan.balance.toLocaleString("ko-KR")}</td>
                <td>{loan.loanTerm}</td>
                <td>{loan.remainingTerm}</td>
                <td>{loan.accountNumber}</td>
                <td>{loan.customerCreditScore}</td>
                <td>{loan.repaymentMethod}</td>
                <td>매달 {loan.repaymentDate}일</td>
                <td>{loan.loanType}</td>
                <td>{new Date(loan.loanDate).toLocaleDateString("ko-KR")}</td>
                <td>{loan.loanProgress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="loanCustomer-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="loanCustomer-footer">
        <select
          className="loanCustomer-footer-select"
          value={selectedProgress}
          onChange={(e) => setSelectedProgress(e.target.value)}
        >
          <option value="">대출 상태 선택</option>
          <option value="승인">승인</option>
          <option value="거절">거절</option>
        </select>
        <button onClick={handleBulkSubmit}>선택 항목 상태 일괄 처리</button>
      </div>
    </div>
  );
};

export default LoanCustomerList;
