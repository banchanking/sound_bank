import React, { useEffect, useState } from "react";
import "../../Css/loan/Loan.css";
import RefreshToken from "../../jwt/RefreshToken";

const LoanCustomerList = () => {
  const [loanStatus, setLoanStatus] = useState([
    {
      loanAmount: 0,
      balance: 0,
    },
  ]);
  const [loan_progress, setLoan_progress] = useState("");

  const loanSubmit = (loan) => {
    RefreshToken.post("/loanStatusUpdate/" + loan.loanStatusNo, {
      loan_progress: loan_progress,
      customerId: loan.customer_id,
    })
      .then((res) => {
        if (res.status === 200) {
          alert("대출 심사 결과가 성공적으로 반영되었습니다.");
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
            <th colSpan={18}>
              <h2>대출 가입 고객 목록</h2>
            </th>
          </tr>
          <tr>
            <th>no</th>
            <th>고객 아이디</th>
            <th>대출 상품명</th>
            <th>적용 금리</th>
            <th>대출 금액</th>
            <th>잔여 대출금</th>
            <th>총 상환횟수</th>
            <th>잔여 상환횟수</th>
            <th>상환 계좌번호</th>
            <th>고객 신용점수</th>
            <th>고객 연 소득</th>
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
            <tr key={loan.loanStatusNo}>
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
              <td>{loan.customerIncome}</td>
              <td>{loan.repaymentMethod}</td>
              <td>매달 {loan.repaymentDate}일</td>
              <td>{loan.loanType}</td>
              <td>{new Date(loan.loanDate).toLocaleDateString("ko-KR")}</td>
              <td>{loan.loanProgress}</td>
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
