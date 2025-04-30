import React, { useState } from "react";
import styles from "../../Css/fund/FundList.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const FundTestManage = () => {
  // 예측된 펀드 리스트를 저장할 상태
  const [predictions, setPredictions] = useState([]);
  // 작업 결과 메시지
  const [message, setMessage] = useState("");
  // API 요청 중 로딩 상태
  const [loading, setLoading] = useState(false);

  // AI 모델 재학습 API 호출
  const handleRetrain = async () => {
    try {
      setLoading(true);
      const res = await RefreshToken.post("http://127.0.0.1:8000/retrain");
      setMessage(res.data.message);
    } catch (err) {
      console.error("AI 모델 재학습 실패:", err);
      setMessage("AI 모델 재학습 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // 펀드 투자성향 예측 API 호출 → predictions 상태에 저장
  const handlePredictFund = async () => {
    try {
      setLoading(true);
      const res = await RefreshToken.post("http://127.0.0.1:8000/predict-fund");
      console.log("[handlePredictFund] res.data =", res.data);

      // FastAPI가 반환한 predictions 배열 추출
      const preds = res.data.predictions;
      if (!Array.isArray(preds) || preds.length === 0) {
        console.warn("예측 결과가 비어 있거나 형식이 올바르지 않습니다.");
        setMessage("서버 응답 형식 오류 또는 예측 결과 없음");
        return;
      }

      // 상태에 저장
      setPredictions(preds);
      setMessage("펀드 성향 예측 완료 (예측 데이터 준비됨)");
    } catch (err) {
      console.error("펀드 성향 예측 실패:", err);
      setMessage("펀드 성향 예측 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // predictions 상태를 Spring Boot API로 보내 DB 업데이트
  const handleUpdateDB = async () => {
    if (predictions.length === 0) {
      setMessage("먼저 ‘펀드 성향 예측’ 버튼을 눌러주세요");
      return;
    }
    try {
      setLoading(true);
      await RefreshToken.post("/updateRiskTypes", predictions);
      setMessage("DB 업데이트 완료");
    } catch (err) {
      console.error("DB 업데이트 실패:", err);
      setMessage("DB 업데이트 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.aiManagementContainer}>
      <h2 className={styles.aiManagementTitle}>투자성향분석 AI 관리</h2>

      {/* AI 모델 재학습 */}
      <button
        className={styles.aiButton}
        onClick={handleRetrain}
        disabled={loading}
      >
        AI 모델 재학습
      </button>

      {/* 펀드 성향 예측 (predictions 상태 채우기) */}
      <button
        className={styles.aiButton}
        onClick={handlePredictFund}
        disabled={loading}
      >
        펀드 성향 예측
      </button>

      {/* 예측된 데이터를 DB에 반영 */}
      <button
        className={styles.aiButton}
        onClick={handleUpdateDB}
        disabled={loading}
      >
        펀드성향 데이터 업데이트
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
