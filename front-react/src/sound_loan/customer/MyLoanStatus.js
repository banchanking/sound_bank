import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/loan/MyLoanStatus.css";
import { useNavigate } from "react-router-dom";

const MyLoanStatus = ({ onRefresh = () => {} }) => {
  const [loanStatusList, setLoanStatusList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handlePrepayment = (loan) => {
    if (!window.confirm("중도상환 하시겠습니까?")) return;

    const payload = {
      loanStatusNo: loan.loanStatusNo,
      balance: loan.balance,
      loanDate: loan.loanDate,
      prepayment_penalty: loan.prepayment_penalty,
    };

    RefreshToken.post("/calculatePrepaymentPenalty", payload)
      .then((res) => {
        if (res.data.status === "success") {
          console.log(res);
          alert(res.data.message); // ✅ "중도상환 완료"
          onRefresh();
        } else {
          alert(res.data.message); // ✅ 실패 메시지 ("중도상환 실패" 등)
        }
      })
      .catch((err) => {
        console.error("중도상환 에러:", err);
        if (err.response && err.response.data && err.response.data.message) {
          alert(err.response.data.message); // ✅ 서버가 보내준 에러메시지 (예: "계좌 잔액 부족")
        } else {
          alert("서버 통신 중 오류가 발생했습니다.");
        }
      });
  };

  useEffect(() => {
    if (!localStorage.getItem("customerId")) {
      alert("로그인이 필요한 서비스입니다.");

      navigate("/");
      return;
    }
    RefreshToken.get("/myLoanStatus", {
      params: { customerId: localStorage.getItem("customerId") },
    })
      .then((res) => {
        setLoanStatusList(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("대출 현황 조회 에러:", err);
        alert("서버 통신 중 오류가 발생했습니다.");
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="myLoanStatus-cardContainer">
      <h2 className="myLoanStatus-title">
        {localStorage.getItem("customerId")}님의 대출 현황
      </h2>

      {isLoading ? (
        <div className="myLoanStatus-spinnerContainer">
          <div className="myLoanStatus-spinner"></div>
        </div>
      ) : loanStatusList.length > 0 ? (
        <div className="myLoanStatus-cardList">
          {loanStatusList.map((loan) => (
            <div className="myLoanStatus-card" key={loan.no}>
              <div>
                <strong>상품명:</strong> {loan.loanName}
              </div>
              <div>
                <strong>금리:</strong> {loan.interestRate}%
              </div>
              <div>
                <strong>대출금:</strong> {loan.loanAmount.toLocaleString()}원
              </div>
              <div>
                <strong>잔여금:</strong> {loan.balance.toLocaleString()}원
              </div>
              <div>
                <strong>상환횟수:</strong> {loan.loanTerm}회 /{" "}
                {loan.remainingTerm}회 남음
              </div>
              <div>
                <strong>계좌번호:</strong> {loan.accountNumber}
              </div>
              <div>
                <strong>방식:</strong> {loan.repaymentMethod}
              </div>
              <div>
                <strong>상환일:</strong> 매달 {loan.repaymentDate}일
              </div>
              <div>
                <strong>유형:</strong> {loan.loanType}
              </div>
              <div>
                <strong>신청일:</strong> {formatDate(loan.loanDate)}
              </div>
              <div>
                <strong>진행상황:</strong> {loan.loanProgress}
              </div>
              <div>
                <strong>수수료:</strong> {loan.prepayment_penalty}%
              </div>
              <div>
                {loan.loanProgress === "신청" ? (
                  <button className="myLoanStatus-button" disabled>
                    미승인
                  </button>
                ) : loan.loanProgress === "중도상환" ||
                  loan.loanProgress === "만기" ? (
                  <button className="myLoanStatus-button" disabled>
                    상환완료
                  </button>
                ) : (
                  <button
                    className="myLoanStatus-button"
                    onClick={() => handlePrepayment(loan)}
                  >
                    중도상환
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="myLoanStatus-empty">진행 중인 대출이 없습니다.</p>
      )}
    </div>
  );
};

export default MyLoanStatus;
