import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../Css/loan/Loan.css";

const LoanList = (props) => {
  const [loanList, setLoanList] = useState([
    {
      loan_id: 0,
      loan_name: "",
      loan_min_amount: 0, // 최소 대출 금액
      loan_max_amount: 0, // 최대 대출 금액
      interest_rate: 0.0,
      loan_term: 0,
      loan_info: "",
      loan_type: "",
    },
  ]);

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
      })
      .catch((error) => {
        console.error("데이터 가져오기 오류:", error);
      });
  }, []);

  return (
    <div className="loanList">
      <table className="insertTable">
        <thead>
          <tr>
            <th colSpan={10}>
              <h2>대출 상품 목록</h2>
            </th>
          </tr>
          <tr>
            <th>대출 아이디</th>
            <th>대출 상품명</th>
            <th>대출 유형</th>
            <th>최소 대출 금액</th>
            <th>최대 대출 금액</th>
            <th>이자율</th>
            <th>중도상환수수료(율)</th>
            <th>대출기간</th>
            <th>대출정보</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {loanList.map((loan) => (
            <tr key={loan.loan_id}>
              <td>{loan.loan_id}</td>
              <td>{loan.loan_name}</td>
              <td>{loan.loan_type}</td>
              <td>
                {loan.loan_min_amount >= 10000
                  ? `${(loan.loan_min_amount / 10000).toLocaleString()} 억원` // 10,000만원 이상일 경우 억원 단위로 표기
                  : `${loan.loan_min_amount.toLocaleString()} 만원`}
              </td>
              <td>
                {loan.loan_max_amount >= 10000
                  ? `${(loan.loan_max_amount / 10000).toLocaleString()} 억원` // 10,000만원 이상일 경우 억원 단위로 표기
                  : `${loan.loan_max_amount.toLocaleString()} 만원`}
              </td>
              <td>{loan.interest_rate}%</td>
              <td>{loan.prepayment_penalty}%</td>
              <td>{loan.loan_term}</td>
              <td>{loan.loan_info}</td>
              <td>
                <Link to={"/loanDetail/" + loan.loan_id}>상세보기</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoanList;
