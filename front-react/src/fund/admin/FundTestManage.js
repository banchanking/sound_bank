import React, { useState } from "react";
import Papa from "papaparse";
import styles from "../../Css/fund/FundList.module.css"; // 스타일 파일 추가
import RefreshToken from "../../jwt/RefreshToken"; // 인증 포함된 인스턴스 사용

const FundTestManage = () => {
  const [message, setMessage] = useState("");

  // 모델 재학습 트리거
  const handleRetrain = async () => {
    try {
      const response = await RefreshToken.post("http://127.0.0.1:8000/retrain");
      setMessage(response.data.message);
    } catch (error) {
      console.error("AI모델 재학습 요청 실패:", error);
      setMessage("AI모델 재학습 중 오류 발생");
    }
  };

  // [2] 펀드 성향 예측 (fundList.csv ➝ fundList_updated.csv)
  const handlePredictFund = async () => {
    try {
      const response = await RefreshToken.post("http://127.0.0.1:8000/predict-fund");
      console.log("예측 결과:", response.data);
      alert("펀드 성향 예측 완료!");
    } catch (error) {
      console.error("펀드 성향 예측 실패:", error);
      alert("예측 실패!");
    }
  };

  // 펀드 성향 DB 업데이트
  const updateRiskTypesToDB = async () => {
    try {
      const response = await fetch("/data/fundList_updated.csv");
      const text = await response.text();
      const rows = Papa.parse(text, { header: true }).data;
  
      await RefreshToken.post("http://localhost:8081/api/updateRiskTypes", rows);
      alert("데이터 업데이트 완료!");
    } catch (error) {
      console.error("데이터 업데이트 실패:", error);
      alert("데이터 업데이트 실패!");
    }
  };

  return (
    <div>
      <h2>펀드 성향 AI 관리</h2>
      <button onClick={handleRetrain}>🔄 AI모델 재학습</button>
      <button onClick={handlePredictFund}>🤖 펀드 투자성향 예측</button>
      <button onClick={updateRiskTypesToDB}>💾 펀드성향 데이터 업데이트</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FundTestManage;
