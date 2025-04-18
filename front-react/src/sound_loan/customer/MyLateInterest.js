import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/MyLoanStatus.css"; // 스피너 스타일도 포함됨

const MyLateInterest = () => {
  const [lateList, setLateList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    RefreshToken.get("/myLateInterest", {
      params: {
        customerId: localStorage.getItem("customerId"),
      },
    })
      .then((res) => {
        setLateList(res.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("서버 통신 오류:", error);
        alert("연체 이력 조회 중 오류 발생!");
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="totalArea">
      {isLoading ? (
        <div className="spinnerContainer">
          <div className="spinner"></div>
        </div>
      ) : lateList.length > 0 ? (
        <table className="tableArea">
          <thead className="theadArea">
            <tr>
              <th colSpan={10}>
                {localStorage.getItem("customerId")}님의 연체 이력
              </th>
            </tr>
          </thead>
          <tbody className="tbodyArea">
            <tr>
              <th>No</th>
              <th>이자납입내역번호</th>
              <th>대출 상품 ID</th>
              <th>연체 고객 ID</th>
              <th>미납 금액</th>
              <th>연체 이자</th>
              <th>상환 상태</th>
            </tr>
            {lateList.map((item, index) => (
              <tr key={item.latePaymentNo || index}>
                <td>{index + 1}</td>
                <td>{item.interestPaymentNo}</td>
                <td>{item.loanId}</td>
                <td>{item.customerId}</td>
                <td>{item.unpaidAmount.toLocaleString("ko-KR")}원</td>
                <td>{item.overdueInterest.toLocaleString("ko-KR")}원</td>
                <td>{item.repaymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="noDataMessage">
          <p>연체 이력이 존재하지 않습니다.</p>
        </div>
      )}
    </div>
  );
};

export default MyLateInterest;
