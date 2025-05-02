import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Css/loan/LoanList.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const LoanList = ({ onEdit }) => {
  const [loanList, setLoanList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState([]);
  const navigate = useNavigate();

  const fetchData = () => {
    RefreshToken.get("/loanList")
      .then((res) => {
        setLoanList(res.data);
        setFilteredList(res.data);
      })
      .catch((error) => {
        console.error("데이터 가져오기 오류:", error);
      });
  };

  const handleDetailClick = (loanId) => {
    navigate("/adminPage", {
      state: { component: "LoanDetail", loan_id: loanId },
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearch = () => {
    const filtered = loanList.filter((loan) =>
      loan.loan_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(filtered);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilteredList(loanList);
    setSearchTerm("");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentData = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={styles.loanListContainer}>
      <h2 className={styles.title}>대출 상품 목록</h2>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="상품명을 입력하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>검색</button>
        <button onClick={handleReset}>전체목록</button>
      </div>

      <table className={styles.loanTable}>
        <thead>
          <tr>
            <th>아이디</th>
            <th>상품명</th>
            <th>유형</th>
            <th>최소금액</th>
            <th>최대금액</th>
            <th>이자율</th>
            <th>수수료</th>
            <th>기간</th>
            <th>정보</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((loan) => (
            <tr key={loan.loan_id}>
              <td>{loan.loan_id}</td>
              <td>{loan.loan_name}</td>
              <td>{loan.loan_type}</td>
              <td>
                {loan.loan_min_amount >= 10000
                  ? `${(loan.loan_min_amount / 10000).toLocaleString()} 억원`
                  : `${loan.loan_min_amount.toLocaleString()} 만원`}
              </td>
              <td>
                {loan.loan_max_amount >= 10000
                  ? `${(loan.loan_max_amount / 10000).toLocaleString()} 억원`
                  : `${loan.loan_max_amount.toLocaleString()} 만원`}
              </td>
              <td>{loan.interest_rate}%</td>
              <td>{loan.prepayment_penalty}%</td>
              <td>{loan.loan_term}년</td>
              <td className={styles.loanInfo}>{loan.loan_info}</td>
              <td>
                <button
                  className={styles.detailButton}
                  onClick={() => handleDetailClick(loan.loan_id)}
                >
                  상세보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? styles.active : ""}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanList;
