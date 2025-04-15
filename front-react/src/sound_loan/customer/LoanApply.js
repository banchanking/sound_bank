import React, { useEffect, useState } from "react";
import "../../Css/loan/LoanApply.css";
import { Link, useNavigate } from "react-router-dom";
import { getCustomerID } from "../../jwt/AxiosToken";

const LoanApply = () => {
  const [loanList, setLoanList] = useState([]);
  const [loanCnt, setLoanCnt] = useState(0);
  const [loan_name, setLoan_name] = useState("");
  const [searchResult, setSearchResult] = useState(false);
  const navigate = useNavigate();

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = loanList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(loanList.length / itemsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? "active-page" : ""}
          style={{ margin: "0 5px" }}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  const searchName = () => {
    fetch(
      `http://localhost:8081/api/loanNameSearch/?loan_name=${encodeURIComponent(
        loan_name
      )}`
    )
      .then((res) => res.json())
      .then((res) => {
        setLoanList(res);
        setSearchResult(res.length === 0);
        setCurrentPage(1);
      });

    fetch(
      `http://localhost:8081/api/loanNameCnt/?loan_name=${encodeURIComponent(
        loan_name
      )}`
    )
      .then((res) => res.json())
      .then((res) => setLoanCnt(res));
  };

  const searchType = (e) => {
    const loan_type = e.target.value;
    const isAll = loan_type === "전체";
    const url = isAll
      ? "http://localhost:8081/api/loanList"
      : `http://localhost:8081/api/loanTypeSearch/?loan_type=${encodeURIComponent(
          loan_type
        )}`;
    const cntUrl = isAll
      ? "http://localhost:8081/api/loanCnt"
      : `http://localhost:8081/api/loanTypeCnt/?loan_type=${encodeURIComponent(
          loan_type
        )}`;

    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setLoanList(res);
        setSearchResult(false);
        setCurrentPage(1);
      });

    fetch(cntUrl)
      .then((res) => res.json())
      .then((res) => setLoanCnt(res));
  };

  useEffect(() => {
    fetch("http://localhost:8081/api/loanList")
      .then((res) => res.json())
      .then((res) => {
        setLoanList(res);
        setSearchResult(false);
      });

    fetch("http://localhost:8081/api/loanCnt")
      .then((res) => res.json())
      .then((res) => setLoanCnt(res));
  }, []);

  const loanApply = (event) => {
    if (getCustomerID() == null) {
      event.preventDefault();
      alert("로그인이 필요한 서비스입니다.");
      if (window.confirm("로그인하시겠습니까?")) {
        navigate("/login");
      }
    } else {
      alert("대출신청 전 개인정보 수집 이용·제공 동의서 화면으로 이동합니다.");
    }
  };

  return (
    <div style={{ minHeight: 600 }}>
      <div className="box">
        <div className="LoanSearch">
          <h2>상품 검색</h2>
          <br />
          <div className="TextSearch">
            <input
              type="text"
              placeholder="상품명을 입력해주세요"
              style={{ width: "350px" }}
              onChange={(e) => setLoan_name(e.target.value)}
            />
            <button onClick={searchName}>검색</button>
          </div>
          <div className="BtnSearch">
            <h3>상품 유형</h3>
            <div className="TypeBtn">
              {[
                "전체",
                "신용 대출",
                "담보 대출",
                "전세 대출",
                "자동차 대출",
                "정책자금 대출",
              ].map((type) => (
                <button key={type} onClick={searchType} value={type}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          <hr />
        </div>

        <div>
          {searchResult && <h2>해당되는 상품이 없습니다.</h2>}
          <h2>상품 목록 : {loanCnt}건 </h2>
          {currentItems.map((loan) => (
            <div className="container" key={loan.loan_id}>
              <div className="LoanDisplay">
                <div className="InfoArea">
                  <p>{loan.loan_type}</p>
                  <h2>{loan.loan_name}</h2>연 {loan.interest_rate}%<br />
                  {loan.loan_info}
                  <br />
                  대출 기간 : 최대 {loan.loan_term} 년<br />
                </div>
                <div className="AmontArea">
                  대출 한도 <br />
                  {loan.loan_min_amount >= 10000
                    ? `${(loan.loan_min_amount / 10000).toLocaleString()} 억원`
                    : `${loan.loan_min_amount.toLocaleString()} 만원`}{" "}
                  ~
                  {loan.loan_max_amount >= 10000
                    ? `${(loan.loan_max_amount / 10000).toLocaleString()} 억원`
                    : `${loan.loan_max_amount.toLocaleString()} 만원`}
                  <br />
                </div>
                <div className="ButtonArea">
                  <Link
                    className="link"
                    to={`/loanAgreement/${loan.loan_id}`}
                    onClick={loanApply}
                  >
                    신청하기
                  </Link>
                </div>
              </div>
              <hr />
            </div>
          ))}
          <div className="pagination">{renderPageNumbers()}</div>
        </div>
      </div>
    </div>
  );
};

export default LoanApply;
