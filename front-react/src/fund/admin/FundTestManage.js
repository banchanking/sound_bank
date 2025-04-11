import React, { useState } from "react";
import Papa from "papaparse";
import RefreshToken from "../../jwt/RefreshToken"; // 인증 포함된 인스턴스 사용

const FundTestManage = () => {
  const [message, setMessage] = useState("");

  // 펀드 성향 DB 업데이트 CSV 기반 DB 업데이트
  const updateRiskTypesToDB = async () => {
    try {
      const response = await fetch("/data/fundList_updated.csv");
      const text = await response.text();
      const rows = Papa.parse(text, { header: true }).data;
  
      await RefreshToken.post("http://localhost:8081/api/updateRiskTypes", rows);
      alert("DB 업데이트 완료!");
    } catch (error) {
      console.error("DB 업데이트 실패:", error);
      alert("DB 업데이트 실패!");
    }
  };

  // 모델 재학습 트리거
  const handleRetrain = async () => {
    try {
      const response = await RefreshToken.post("http://127.0.0.1:8000/retrain");
      setMessage(response.data.message);
    } catch (error) {
      console.error("모델 재학습 요청 실패:", error);
      setMessage("모델 재학습 중 오류 발생");
    }
  };

  return (
    <div className="fund-test-manage">
      <h2>투자 성향 모델 관리</h2>
      <button onClick={updateRiskTypesToDB}>펀드 성향 DB 업데이트</button>
      <button onClick={handleRetrain}>모델 재학습</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FundTestManage;
