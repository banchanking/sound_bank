// ✅ 최종 정리된 FundTestManage.js (로딩+메시지 일관 처리)
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import FundCustomer from "./FundCustomer";
import Papa from "papaparse";
import styles from "../../Css/fund/FundList.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const FundTestManage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
    }
  }, []);

  // ✅ AI 모델 재학습 요청
  const handleRetrain = async () => {
    try {
      setLoading(true);
      const response = await RefreshToken.post("http://127.0.0.1:8000/retrain");
      setMessage(response.data.message);
    } catch (error) {
      console.error("AI모델 재학습 요청 실패:", error);
      setMessage("AI모델 재학습 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 펀드 투자성향 예측 요청
  const handlePredictFund = async () => {
    try {
      setLoading(true);
      const response = await RefreshToken.post("http://127.0.0.1:8000/predict-fund");
      console.log("예측 결과:", response.data);
      alert("펀드 성향 예측 완료!");
      setMessage("펀드 성향 예측 완료!");
    } catch (error) {
      console.error("펀드 성향 예측 실패:", error);
      setMessage("펀드 성향 예측 중 오류 발생");
      alert("예측 실패!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 펀드성향 DB 업데이트 요청
  const updateRiskTypesToDB = async () => {
    try {
      setLoading(true);
      const response = await fetch("/data/fundList_updated.csv");
      const text = await response.text();
      const parsed = Papa.parse(text, { header: true }).data;

      // fund_name, fund_risk_type만 보내기
      const filteredRows = parsed.map(row => ({
        fund_name: row.fund_name?.trim(),
        fund_risk_type: row.fund_risk_type?.trim()
      }));

      await RefreshToken.post("/updateRiskTypes", filteredRows);
      alert("데이터 업데이트 완료!");
      setMessage("펀드 데이터 업데이트 완료!");
    } catch (error) {
      console.error("데이터 업데이트 실패:", error);
      setMessage("데이터 업데이트 실패!");
      alert("데이터 업데이트 실패!");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => navigate("/login");
  const handleCancel = () => navigate("/");

  return (
    <>
      {showModal && (
        <FundCustomer
          message="로그인이 필요한 서비스입니다."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <div className={styles.fundContainer}>
        <h2 className={styles.fundTitle}>투자성향분석 AI 관리</h2>
        <div className={styles.fundTable}> 
          {/* 버튼 3개 */}
          <br /><br /><br />
          <button className={styles.fundButton} onClick={handleRetrain}>🔄 AI모델 재학습</button>
          <button className={styles.fundButton} onClick={handlePredictFund}>🤖 펀드 투자성향 예측</button>
          <button className={styles.fundButton} onClick={updateRiskTypesToDB}>💾 펀드성향 데이터 업데이트</button>
          {loading && <p style={{ color: "#2563eb", fontWeight: "bold" }}>⏳ 진행 중입니다...</p>}
          {message && <p style={{ color: "#333", marginTop: "10px" }}>{message}</p>}
        </div>
      </div>
    </>
  );
};

export default FundTestManage;
