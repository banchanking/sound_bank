import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../Css/fund/Fund.css"; // 스타일 파일 추가

// 투자성향 테스트 질문과 점수 매핑
const questions = [
  {
    id: 1,
    question: "금융투자상품에 대한 이해도는 어느 정도인가요?",
    options: [
      "투자상품 설명서를 읽고 스스로 상품의 특징과 위험을 이해함",
      "투자상품 설명을 들으면 특징과 위험을 이해함",
      "예금과 펀드의 차이점을 알고 구별할 수 있음",
      "투자상품에 대해 스스로 결정을 해 본적이 없음",
    ],
    weights: [5, 4, 3, 1],
  },
  {
    id: 2,
    question: "고객님의 수입원은 어떻게 되시나요?",
    options: [
      "현재 일정한 수입이 있고, 향후 유지 또는 증가 예상",
      "현재 일정한 수입이 발생하나 향후 불안정 또는 감소 예상",
      "현재 일정한 수입이 없거나, 연금 등이 주 수입원임",
    ],
    weights: [5, 3, 1],
  },
  {
    id: 3,
    question: "고객님의 연간 소득은 어떻게 되시나요?",
    options: ["2천만원 이하", "5천만원 이하", "1억원 이하", "1억원 초과"],
    weights: [1, 2, 3, 5],
  },
  {
    id: 4,
    question: "고객님이 주로 투자한 금융상품은 어느 것인가요?",
    options: [
      "주식형펀드, 파생상품펀드, 주식, ELW, 선물옵션 등",
      "인덱스 주식형펀드, 원금 비보존 ELS(DLS), 신용도 낮은 회사채 등",
      "혼합형펀드, 원금 일부 보존추구 ELS(DLS), 신용도 중간등급 회사채 등",
      "채권형 펀드, 원금 보존추구 ELB(DLB), 금융채, 신용도 높은 회사채 등",
      "은행 예적금, 국채, 지방채, 보증채, MMF, CMA 등",
    ],
    weights: [5, 4, 3, 2, 1],
  },
  {
    id: 5,
    question: "총 자산대비 투자상품의 비중은 어떻게 되시나요?",
    options: ["10% 이하", "15% 이하", "20% 이하", "25% 이하", "25% 초과"],
    weights: [1, 2, 3, 4, 5],
  },
  {
    id: 6,
    question: "파생상품, 파생결합증권, 파생상품 투자펀드에 투자한 기간은 어떻게 되시나요?",
    options: ["3년 초과", "3년 이하", "1년 이하", "투자 경험 없음"],
    weights: [5, 4, 3, 1],
  },
  {
    id: 7,
    question: "투자금에 대한 기대수익 대비 감내 가능한 손실 수준은 어떻게 되시나요?",
    options: [
      "30% 초과 또는 원금 전액 손실 감내 가능",
      "30% 이내 손실 감내 가능",
      "10% 이내 손실 감내 가능",
      "반드시 투자원금은 보존되어야 함",
    ],
    weights: [5, 4, 3, 1],
  },
  {
    id: 8,
    question: "현재 금융투자상품에 가입하는 목적은 어떻게 되시나요?",
    options: [
      "자산 증식(여유 자금 투자)",
      "목적자금 마련(결혼, 교육, 노후자금 등)",
      "퇴직금 운용",
      "사용예정자금(전세금, 임대차 보증금) 단기운용",
    ],
    weights: [5, 4, 3, 1],
  },
  {
    id: 9,
    question: "투자하려는 자금의 투자기간은 얼마나 되시나요?",
    options: ["투자기간 상관없음", "3년 이상", "2년 이상", "1년 이상", "1년 미만"],
    weights: [5, 4, 3, 2, 1],
  },
];

const FundTest = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(Array(questions.length).fill(null)); // 초기 상태는 null로 설정
  const [result, setResult] = useState(null);

  // 사용자가 선택한 답변을 업데이트하는 함수
  const handleChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value; // 선택한 답변을 업데이트
    setAnswers(newAnswers);
  };

  // 서버로 데이터 전송 후 결과를 받아오는 함수
  const handleSubmit = async () => {
    try {
      // 체크되지 않은 문항 찾기
      const unansweredIndex = answers.findIndex(answer => answer === null);
  
      // 체크되지 않은 문항이 있을 경우 alert 표시하고 함수 실행을 중단
      if (unansweredIndex !== -1) {
        alert(`${unansweredIndex + 1}번 문항의 답을 체크해 주세요.`);

        // 체크되지 않은 문항으로 스크롤 이동
        const element = document.getElementById(`question-${unansweredIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // 점수 계산
      const totalScore = answers.reduce(
        (sum, answer, index) => sum + questions[index].weights[answer - 1],
        0
      );

      // 투자 성향 분류
      let investmentType = "";
      if (totalScore <= 15) investmentType = "안정형";
      else if (totalScore <= 25) investmentType = "보수형";
      else if (totalScore <= 35) investmentType = "위험중립형";
      else if (totalScore <= 45) investmentType = "적극형";
      else investmentType = "공격형";

      setResult(investmentType);      

      // 모든 문항이 체크된 경우 서버로 데이터 전송
      // 서버로 전송할 데이터 준비
      const payload = { answers, investmentType};  // answers와 investmentType을 포함한 객체 생성
      console.log("Submitting payload:", payload); // 디버깅용 로그

      // 서버로 POST 요청
      const response = await axios.post("http://127.0.0.1:8000/predict", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Server response:", response.data); // 디버깅용 로그

      // 결과를 결과 페이지로 이동
      navigate("/test-result", { state: { result: response.data.investment_type } });
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("서버 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="fund-test-container">
      <h2 className="fund-test-title">투자성향 분석</h2>
      <div className="fund-test-card">
        {questions.map((question, index) => (
          <div key={index} id={`question-${index}`} className="fund-test-question">
            <p className="fund-test-question-title">{question.question}</p>
            {question.options.map((option, optionIndex) => (
              <div key={optionIndex} className="fund-test-option">
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={optionIndex + 1} // 선택지를 숫자로 매핑
                  checked={answers[index] === optionIndex + 1} // 수정된 checked 조건
                  onChange={() => handleChange(index, optionIndex + 1)} // 숫자 값으로 업데이트
                />
                <label>{option}</label>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="fund-test-submit" onClick={handleSubmit}>
        결과 확인
      </button>
      {result !== null && <h3 className="fund-test-result">예측된 투자 성향: {result}</h3>}
    </div>
  );
};

export default FundTest;