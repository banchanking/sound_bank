import React, { useState } from "react";
import axios from "axios";   
import styles from "../../Css/fund/FundList.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const FundTestManage = () => {
  // 처리 결과 메시지
  const [message, setMessage] = useState("");
  // API 요청 중 로딩 상태
  const [loading, setLoading] = useState(false);

  // 펀드 투자성향 예측 API 호출 → predictions 상태에 저장
  const handlePredictAndUpdate = async () => {
    
    try {
      // 1) 예측
      setLoading(true);
      setMessage("");

      // 1) FastAPI로 전체 펀드 예측 요청
      const res = await axios.post("http://127.0.0.1:8000/predict-fund");
      console.log("[handlePredictFund] res.data =", res.data);

      // 2) 바로 DB 업데이트
      const preds = res.data.predictions;  
      if (!Array.isArray(preds) || preds.length === 0) {
        console.warn("예측 결과가 비어 있거나 형식이 올바르지 않습니다.");
        setMessage("서버 응답 형식 오류 또는 예측 결과 없음");
        return;
      }

      // 2) Spring Boot API로 예측 결과 전송 → DB 반영
      await RefreshToken.post("/updateRiskTypes", preds);
      console.log("DB 업데이트 완료");
      setMessage("펀드 성향 예측 완료 (예측 데이터 준비됨)");
    } catch (err) {
      console.error("펀드 성향 예측 또는 업데이트 실패:", err);
      setMessage("펀드 성향 예측 또는 업데이트 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.aiManagementContainer}>
      <h2 className={styles.aiManagementTitle}>투자성향분석 AI 관리</h2>

      {/* 펀드 성향 예측 (predictions 상태 채우기) */}
      <br></br>
      <br></br>
      <br></br>
      <button
        className={styles.aiButton}
        onClick={handlePredictAndUpdate}
        disabled={loading}
      >
        ⚙️ 펀드 성향 예측 및 성향 업데이트
      </button>

      {/* 로딩 상태 표시 */}
      {loading && (
        <p style={{ color: "#2563eb", fontWeight: "bold" }}>
          진행 중입니다...
        </p>
      )}

      {/* 처리 결과 메시지 표시 */}
      {message && (
        <p style={{ color: "#333", marginTop: "10px" }}>{message}</p>
      )}
    </div>
  );
};

export default FundTestManage;
