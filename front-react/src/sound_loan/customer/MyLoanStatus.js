import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/MyLoanStatus.css";

const MyLoanStatus = () => {
  const [myLoanStatus, setMyLoanStatus] = useState([]);

  useEffect(() => {
    RefreshToken.get("/myLoanStatus", {
      params: {
        customerId: localStorage.getItem("customerId"),
      },
    })
      .then((res) => {
        setMyLoanStatus(res.data); // res.data는 JSON
      })
      .catch((error) => {
        console.error("서버 통신 에러: ", error);
        alert("서버 통신 중 에러 발생!");
      });
  }, [setMyLoanStatus]);
  return (
    <div className="totalArea">
      <table className="tableArea">
        <thead className="theadArea">
          <th>나의 대출 현황</th>
        </thead>

        <tbody className="tbodyArea">
          <tr>
            <th>no</th>
            <th>대출 상품명</th>
            <th>적용 금리</th>
            <th>대출 금액</th>
            <th>잔여 대출금</th>
            <th>총 상환횟수</th>
            <th>잔여 상환횟수</th>
            <th>상환 계좌번호</th>
            <th>대출 상환방식</th>
            <th>대출금 상환일</th>
            <th>대출 유형</th>
            <th>대출 신청일</th>
            <th>대출 진행상황</th>
          </tr>
          {myLoanStatus.map((my) => (
            <tr key={my.no}>
              <td>{my.no}</td>
              <td>{my.loanName}</td>
              <td>{my.interestRate}%</td>
              <td>{my.loanAmount.toLocaleString("ko-KR")}원</td>
              <td>{my.balance.toLocaleString("ko-KR")}원</td>
              <td>{my.loanTerm}회</td>
              <td>{my.remainingTerm}회</td>
              <td>{my.accountNumber}</td>
              <td>{my.repaymentMethod}</td>
              <td>{my.repatmentDate}</td>
              <td>{my.loanType}</td>
              <td>{my.loanDate}</td>
              <td>{my.loanProgress}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyLoanStatus;
