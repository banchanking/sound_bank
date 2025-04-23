import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import RefreshToken from "../../jwt/RefreshToken";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate, useParams } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

const LoanCreditScore = () => {
  const { loan_id } = useParams();
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const customerId = localStorage.getItem("customerId");
  useEffect(() => {
    if (customerId) {
      RefreshToken.post("/credit-score-request", {
        customerId: localStorage.getItem("customerId"),
      })
        .then((res) => {
          setScore(res.data.creditScore);
        })
        .catch((err) => {
          console.error("점수 불러오기 실패", err);
          alert("신용점수 조회 중 오류가 발생했습니다.");
        });
    }
  }, []);

  const chartData = {
    labels: ["신용점수", "잔여 구간"],
    datasets: [
      {
        data: [score || 0, score ? 990 - score : 990],
        backgroundColor: ["#4caf50", "#e0e0e0"],
        borderWidth: 1,
      },
    ],
  };

  const requestBtn = () => {
    alert("신청정보 화면으로 넘어갑니다.");
    navigate("/loanInfoApply/" + loan_id);
  };

  const resetBtn = () => {
    if (window.confirm("진행중인 대출을 취소하시겠습니까?")) {
      alert("상품목록 화면으로 이동합니다.");
      navigate("/loanApply");
    } else {
      alert("이어서 진행됩니다.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <h2>📊 신용점수 결과</h2>
      {score !== null ? (
        <>
          <h3 style={{ marginTop: "20px" }}>
            {customerId}님의 신용점수는 <strong>{score}점</strong>입니다.
          </h3>
          <div style={{ width: "300px", margin: "auto" }}>
            <Doughnut data={chartData} />
          </div>
        </>
      ) : (
        <p>점수를 불러오는 중입니다...</p>
      )}
      <div>
        <button onClick={() => requestBtn()}>대출 진행</button>
        <button onClick={() => resetBtn()}>신청 취소</button>
      </div>
    </div>
  );
};
export default LoanCreditScore;
