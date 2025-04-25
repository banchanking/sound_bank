import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import RefreshToken from "../../jwt/RefreshToken";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../Css/loan/LoanCreditScore.module.css"; // CSS 모듈 import

const LoanCreditScore = () => {
  const { loan_id } = useParams();
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const customerId = localStorage.getItem("customerId");

  useEffect(() => {
    if (customerId) {
      RefreshToken.post("/credit-score-request", {
        customerId,
      })
        .then((res) => {
          setScore(res.data.creditScore);
        })
        .catch((err) => {
          console.error("점수 불러오기 실패", err);
          alert("신용점수 조회 중 오류가 발생했습니다.");
        });
    }
  }, [customerId]);

  const chartData = {
    labels: ["신용점수", "잔여 구간"],
    datasets: [
      {
        data: [score || 0, score ? 990 - score : 990],
        backgroundColor: ["#1976d2", "#e0e0e0"],
        borderWidth: 1,
      },
    ],
  };

  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart;
      ctx.restore();
      const fontSize = (height / 150).toFixed(2);
      ctx.font = `${fontSize}em sans-serif`;
      ctx.textBaseline = "middle";
      const text = getCreditRank(chart.config.data.datasets[0].data[0]); // score 대신 chart에서 직접 가져옴
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;
      ctx.fillText(text, textX, textY);
      ctx.save();
    },
  };

  const chartOptions = {
    plugins: {
      tooltip: { enabled: true },
      legend: { display: false },
    },
    cutout: "70%",
  };

  const getCreditRank = (score) => {
    if (score >= 900) return "1등급";
    if (score >= 800) return "2등급";
    if (score >= 700) return "3등급";
    if (score >= 600) return "4등급";
    return "5등급";
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

  ChartJS.register(ArcElement, Tooltip, Legend, centerTextPlugin);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📊 신용점수 결과</h2>
      {score !== null ? (
        <>
          <h3 className={styles.scoreText}>
            {customerId}님의 신용점수는 <strong>{score}점</strong>입니다.
          </h3>
          <div className={styles.chartWrapper}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </>
      ) : (
        <p className={styles.loading}>점수를 불러오는 중입니다...</p>
      )}
      <div className={styles.buttonGroup}>
        <button className={styles.btn} onClick={requestBtn}>
          대출 진행
        </button>
        <button className={styles.btn} onClick={resetBtn}>
          신청 취소
        </button>
      </div>
    </div>
  );
};

export default LoanCreditScore;
