import React, { useState } from "react";
import RefreshToken from "../../jwt/RefreshToken"; // 인증 포함된 인스턴스 사용

const FundTestManage = () => {
  const [message, setMessage] = useState("");

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
      <button onClick={handleRetrain}>모델 재학습</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FundTestManage;
