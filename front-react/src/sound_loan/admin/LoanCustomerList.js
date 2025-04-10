import React, { useEffect, useState } from "react";
import "../../Css/loan/Loan.css";
import RefreshToken from "../../jwt/RefreshToken";

const LoanCustomerList = () => {
  const [loanStatus, setLoanStatus] = useState([{}]);
  const [loan_progress, setLoan_progress] = useState("");

  const loanSubmit = (loan) => {
    const customerId = localStorage.getItem("customerId");
    RefreshToken.post("/loanStatusUpdate/" + loan.loan_status_no, {
      loan_progress: loan_progress,
      customerId: customerId,
    })
      .then((res) => {
        if (res.status === 201) {
          alert("대출 심사 결과가 성공적으로 반영되었습니다.");
          window.location.reload(); // 새로고침 or 목록 재요청
        }
      })
      .catch((error) => {
        console.error("심사결과 처리 오류:", error);
        alert("심사 결과 처리 중 오류 발생");
      });
  };

  useEffect(() => {
    RefreshToken.get("/loanStatus")
      .then((res) => {
        setLoanStatus(res.data);
      })
      .catch((error) => {
        console.error("데이터 가져오기 오류:", error);
      });
  }, []);

  return (
    <div style={{ minHeight: 600 }} className="loanInsert">
      <table className="insertTable">
        <thead>
          <tr>
            <th colSpan={14}>
              <h2>대출 가입 고객 목록</h2>
            </th>
          </tr>
          <tr>
            <th>no</th>
            <th>고객 아이디</th>
            <th>대출 상품명</th>
            <th>대출 금액</th>
            <th>잔여 대출금</th>
            <th>상환 계좌번호</th>
            <th>고객 신용점수</th>
            <th>대출 상환방식</th>
            <th>대출금 상환일</th>
            <th>대출 유형</th>
            <th>대출 신청일</th>
            <th>대출 진행상황</th>
            <th>대출 상태 관리</th>
            <th>대출 심사 처리</th>
          </tr>
        </thead>
        <tbody>
          {loanStatus.map((loan) => (
            <tr key={loan.loan_status_no}>
              <td>{loan.loan_status_no}</td>
              <td>{loan.customer_id}</td>
              <td>{loan.loan_name}</td>
              <td>{loan.loan_amount}</td>
              <td>{loan.balance}</td>
              <td>{loan.account_number}</td>
              <td>{loan.customer_credit_score}</td>
              <td>{loan.repayment_method}</td>
              <td>매달 {loan.repayment_date}일</td>
              <td>{loan.loan_type}</td>
              <td>{new Date(loan.loan_date).toLocaleDateString("ko-KR")}</td>
              <td>{loan.loan_progress}</td>
              <td>
                <select
                  onChange={(e) => {
                    setLoan_progress(e.target.value);
                  }}
                >
                  <option value={""}>심사결과</option>
                  <option value={"승인"}>승인</option>
                  <option value={"거절"}>거절</option>
                </select>
              </td>
              <td>
                <input
                  type="button"
                  value={"결과 처리"}
                  onClick={() => loanSubmit(loan)}
                ></input>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoanCustomerList;
