import React, { useEffect, useState } from "react";
import "../../Css/loan/LoanApply.css";

import { Link, useNavigate } from "react-router-dom";
import { getCustomerID } from "../../jwt/AxiosToken";

const LoanApply = (props) => {
  const [loanList, setLoanList] = useState([
    {
      loan_id: 0,
      loan_name: "",
      loan_min_amount: 0,
      loan_max_amount: 0,
      interest_rate: 0.0,
      loan_term: 0,
      loan_info: "",
      loan_type: "",
    },
  ]);

  const [loanCnt, setLoanCnt] = useState(0); // 검색된 상품 갯수
  const [loan_name, setLoan_name] = useState(""); // 검색할 상품 이름
  const [searchResult, setSearchResult] = useState(false); // 검색 결과
  const navigate = useNavigate();
  // 상품 이름 검색
  const searchName = () => {
    fetch(
      `http://localhost:8081/api/loanNameSearch/?loan_name=${encodeURIComponent(
        loan_name
      )}`,
      {
        method: "GET",
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        return res.json();
      })
      .then((res) => {
        setLoanList(res);
        setSearchResult(res.length === 0);
      })
      .catch((error) => {
        console.error("데이터 가져오기 오류:", error);
      });
    // 검색 된 상품 갯수값
    fetch(
      `http://localhost:8081/api/loanNameCnt/?loan_name=${encodeURIComponent(
        loan_name
      )}`,
      {
        method: "GET",
      }
    )
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((res) => {
        setLoanCnt(res);
      })
      .catch((error) => {
        console.error("데이터 가져오기 오류:", error);
      });
  };

  // 상품유형 검색 button의 value값으로 유형 검색
  const searchType = (e) => {
    const loan_type = e.target.value;
    // 전체 상품 검색
    if (loan_type === "전체") {
      fetch("http://localhost:8081/api/loanList", {
        method: "GET",
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((res) => {
          setLoanList(res);
        })
        .catch((error) => {
          console.error("데이터 가져오기 오류:", error);
        });
      fetch("http://localhost:8081/api/loanCnt", {
        method: "GET",
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((res) => {
          setLoanCnt(res);
          setSearchResult(false);
        })
        .catch((error) => {
          console.error("데이터 가져오기 오류:", error);
        });
    }
    // 원하는 상품 유형 검색
    else {
      fetch(
        `http://localhost:8081/api/loanTypeSearch/?loan_type=${encodeURIComponent(
          loan_type
        )}`,
        {
          method: "GET",
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((res) => {
          setLoanList(res);
          setSearchResult(false);
        })
        .catch((error) => {
          console.error("데이터 가져오기 오류:", error);
        });
      fetch(
        `http://localhost:8081/api/loanTypeCnt/?loan_type=${encodeURIComponent(
          loan_type
        )}`,
        {
          method: "GET",
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((res) => {
          setLoanCnt(res);
          setSearchResult(false);
        })
        .catch((error) => {
          console.error("데이터 가져오기 오류:", error);
        });
    }
  };
  // 처음 렌더링 시 전체 대출 상품 리스트 출력
  useEffect(() => {
    fetch("http://localhost:8081/api/loanList", {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((res) => {
        setLoanList(res);
        setSearchResult(false);
      })
      .catch((error) => {
        console.error("데이터 가져오기 오류:", error);
      });
    // 전체 상품 갯수
    fetch("http://localhost:8081/api/loanCnt", {
      method: "GET",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((res) => {
        setLoanCnt(res);
        setSearchResult(false);
      })
      .catch((error) => {
        console.error("데이터 가져오기 오류:", error);
      });
  }, []);

  const loanApply = (event) => {
    if (getCustomerID() == null) {
      event.preventDefault();
      alert("로그인이 필요한 서비스입니다.");
      if (window.confirm("로그인하시겠습니까?")) {
        navigate("/login");
      }
    }
    alert("대출신청 전 개인정보 수집 이용·제공 동의서 화면으로 이동합니다.");
  };

  return (
    <div style={{ minHeight: 600 }}>
      <div className="box">
        <div className="LoanSearch">
          <h2>상품 검색</h2> <br />
          <br />
          <div className="TextSearch">
            <input
              type="text"
              placeholder="상품명을 입력해주세요"
              style={{ width: "350px" }}
              onChange={(e) => {
                setLoan_name(e.target.value);
              }}
            />
            <button onClick={searchName}>검색</button>
          </div>
          <div className="BtnSearch">
            <div>
              <h3>상품 유형</h3>
            </div>
            <div className="TypeBtn">
              <button onClick={searchType} value={"전체"}>
                전체 상품
              </button>
              <button onClick={searchType} value={"신용 대출"}>
                신용대출
              </button>
              <button onClick={searchType} value={"담보 대출"}>
                담보 대출
              </button>
              <button onClick={searchType} value={"전세 대출"}>
                전세 대출
              </button>
              <button onClick={searchType} value={"자동차 대출"}>
                자동차 대출
              </button>
            </div>
          </div>
          <hr />
        </div>

        <div>
          <div>
            {searchResult && <h2>해당되는 상품이 없습니다.</h2>}
            <h2>상품 목록 : {loanCnt}건 </h2>
          </div>
          {loanList.map((loan) => (
            <div className="container" key={loan.loan_id}>
              <div className="LoanDisplay">
                <div className="InfoArea">
                  <p>{loan.loan_type}</p>
                  <h2>{loan.loan_name}</h2>연 {loan.interest_rate}%<br />
                  {loan.loan_info}
                  <br />
                  대출 기간 : 최대 {loan.loan_term} 년 <br />
                </div>

                <div className="AmontArea">
                  대출 한도 <br />
                  {""}
                  {loan.loan_min_amount >= 10000
                    ? `${(loan.loan_min_amount / 10000).toLocaleString()} 억원` // 10,000만원 이상일 경우 억원 단위로 표기
                    : `${loan.loan_min_amount.toLocaleString()} 만원`}{" "}
                  ~
                  {loan.loan_max_amount >= 10000
                    ? `${(loan.loan_max_amount / 10000).toLocaleString()} 억원` // 10,000만원 이상일 경우 억원 단위로 표기
                    : `${loan.loan_max_amount.toLocaleString()} 만원`}{" "}
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
        </div>
      </div>
    </div>
  );
};

export default LoanApply;
