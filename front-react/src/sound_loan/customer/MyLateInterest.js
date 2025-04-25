import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/MyLateInterest.css"; // 전용 스타일

const MyLateInterest = ({ onRefresh }) => {
  const [lateList, setLateList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    RefreshToken.get("/myLateInterest", {
      params: {
        customerId: localStorage.getItem("customerId"),
      },
    })
      .then((res) => {
        setLateList(res.data);
        setIsLoading(false);
        onRefresh();
      })
      .catch((error) => {
        console.error("서버 통신 오류:", error);
        alert("연체 이력 조회 중 오류 발생!");
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="myLateInterest-container">
      <h2 className="myLateInterest-title">
        {localStorage.getItem("customerId")}님의 연체 이력
      </h2>

      {isLoading ? (
        <div className="myLateInterest-spinnerContainer">
          <div className="myLateInterest-spinner"></div>
        </div>
      ) : lateList.length > 0 ? (
        <table className="myLateInterest-table">
          <thead>
            <tr>
              {[
                "No",
                "이자납입내역번호",
                "대출 상품 ID",
                "연체 고객 ID",
                "미납 금액",
                "연체 이자",
                "상환 상태",
              ].map((head, idx) => (
                <th key={idx}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
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
        <p className="myLateInterest-empty">연체 이력이 존재하지 않습니다.</p>
      )}
    </div>
  );
};

export default MyLateInterest;
