import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/MyLoanStatus.css"; // 스피너 스타일 재활용

const MyInterest = ({ onRefresh }) => {
  const [interestList, setInterestList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().split("T")[0];
  };

  const paymentRequest = (my) => {
    RefreshToken.post("/paymentRequest", {
      customerId: localStorage.getItem("customerId"),
      accountNumber: my.accountNumber,
      loanId: my.loanId,
      repaymentAmount: my.repaymentAmount,
      interestpaymentNo: my.interestPaymentNo,
    })
      .then((res) => {
        if (res.status >= 200 && res.status < 300) {
          alert(res.data);
          onRefresh();
        }
      })
      .catch((error) => {
        if (error.response && error.response.data) {
          alert(error.response.data);
        } else {
          alert("서버 오류 또는 네트워크 문제 발생");
          console.log(error);
        }
      });
  };

  useEffect(() => {
    RefreshToken.get("/myInterestList", {
      params: {
        customerId: localStorage.getItem("customerId"),
      },
    })
      .then((res) => {
        setInterestList(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, [setInterestList]);

  return (
    <div className="totalArea">
      {isLoading ? (
        <div className="spinnerContainer">
          <div className="spinner"></div>
        </div>
      ) : interestList.length > 0 ? (
        <table className="tableArea">
          <thead className="theadArea">
            <tr>
              <th colSpan={15}>
                {localStorage.getItem("customerId")}님의 대출 이자 납입 현황
              </th>
            </tr>
          </thead>
          <tbody className="tbodyArea">
            <tr>
              <th>no</th>
              <th>가입상품명</th>
              <th>상환 계좌</th>
              <th>총 납입금액</th>
              <th>납입 이자</th>
              <th>납입 원금</th>
              <th>상환 회차</th>
              <th>처리 날짜</th>
              <th>재처리 날짜</th>
              <th>납입 상태</th>
              <th>미납금 납입 신청</th>
            </tr>
            {interestList.map((my) => (
              <tr key={my.no}>
                <td>{my.no}</td>
                <td>{my.loanName}</td>
                <td>{my.accountNumber}</td>
                <td>{my.repaymentAmount.toLocaleString("ko-KR")}원</td>
                <td>{my.interestAmount.toLocaleString("ko-KR")}원</td>
                <td>{my.principalAmount.toLocaleString("ko-KR")}원</td>
                <td>{my.repaymentTerm}</td>
                <td>{formatDate(my.repaymentDate)}</td>
                <td>
                  {my.actualRepaymentDate
                    ? formatDate(my.actualRepaymentDate)
                    : "x"}
                </td>
                <td>{my.repaymentStatus}</td>
                {my.repaymentStatus === "납부완료" ? (
                  <td>
                    <button>납부완료</button>
                  </td>
                ) : (
                  <td>
                    <button onClick={() => paymentRequest(my)}>납부신청</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="noDataMessage">
          <p>이자 납입 내역이 존재하지 않습니다.</p>
        </div>
      )}
    </div>
  );
};

export default MyInterest;
