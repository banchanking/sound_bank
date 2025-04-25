import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/LoanApply.css";

const LoanApply = () => {
  const [loanList, setLoanList] = useState([]);
  const [loanCnt, setLoanCnt] = useState(0);
  const [loan_name, setLoan_name] = useState("");
  const [searchResult, setSearchResult] = useState(false);
  const [loanTypeFilter, setLoanTypeFilter] = useState("전체");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredLoans = loanList.filter((loan) => {
    const matchesName = loan.loan_name
      .toLowerCase()
      .includes(loan_name.toLowerCase());
    const matchesType =
      loanTypeFilter === "전체" || loan.loan_type === loanTypeFilter;
    return matchesName && matchesType;
  });

  const currentItems = filteredLoans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);

  const renderPageNumbers = () => {
    return Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => setCurrentPage(i + 1)}
        className={currentPage === i + 1 ? "active-page" : ""}
      >
        {i + 1}
      </button>
    ));
  };

  useEffect(() => {
    RefreshToken.get("/loanList")
      .then((res) => {
        setLoanList(res.data);
        setLoanCnt(res.data.length);
        setSearchResult(false);
      })
      .catch();
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
    <div className="loanApplyContainer">
      <div className="loanApplyBox">
        <div className="loanApplySearch">
          <h2>상품 검색</h2>
          <div className="loanApplyTextSearch">
            <input
              type="text"
              placeholder="상품명을 입력해주세요"
              onChange={(e) => setLoan_name(e.target.value)}
            />
          </div>
          <div className="loanApplyTypeSearch">
            <h3>상품 유형</h3>
            <div className="loanApplyTypeButtons">
              {[
                "전체",
                "신용 대출",
                "담보 대출",
                "전세 대출",
                "자동차 대출",
                "정책자금 대출",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setLoanTypeFilter(type);
                    setCurrentPage(1);
                  }}
                  className={loanTypeFilter === type ? "activeTypeButton" : ""}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="loanApplyResult">
          {searchResult && <h2>해당되는 상품이 없습니다.</h2>}
          <h2>상품 목록 : {filteredLoans.length}건 </h2>
          {currentItems.map((loan) => (
            <div className="loanApplyItem" key={loan.loan_id}>
              <div className="loanApplyInfo">
                <div className="loanApplyInfoText">
                  <p>{loan.loan_type}</p>
                  <h2>{loan.loan_name}</h2>
                  <p>연 {loan.interest_rate}%</p>
                  <p>{loan.loan_info}</p>
                  <p>대출 기간 : 최대 {loan.loan_term} 년</p>
                </div>
                <div className="loanApplyLimit">
                  <p>
                    대출 한도
                    <br />
                    {loan.loan_min_amount >= 10000
                      ? `${(
                          loan.loan_min_amount / 10000
                        ).toLocaleString()} 억원`
                      : `${loan.loan_min_amount.toLocaleString()} 만원`}{" "}
                    ~
                    {loan.loan_max_amount >= 10000
                      ? `${(
                          loan.loan_max_amount / 10000
                        ).toLocaleString()} 억원`
                      : `${loan.loan_max_amount.toLocaleString()} 만원`}
                  </p>
                </div>
                <div className="loanApplyButton">
                  <Link
                    className="applyLink"
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
          <div className="loanApplyPagination">{renderPageNumbers()}</div>
        </div>
      </div>
    </div>
  );
};

export default LoanApply;
