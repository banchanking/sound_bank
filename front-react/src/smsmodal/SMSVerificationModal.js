import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import RefreshToken from "../jwt/RefreshToken";
import "../Css/loan/LoanModal.css";

Modal.setAppElement("#root");

const SMSVerificationModal = ({ isOpen, onRequestClose, onVerified }) => {
  const [step, setStep] = useState("request");
  const [customer_name, setCustomer_name] = useState("");
  const [telecom, setTelecom] = useState("");
  const [customer_phone_number, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setStep("request");
      setCustomer_name("");
      setTelecom("");
      setPhoneNumber("");
      setVerificationCode("");
    }
  }, [isOpen]);

  const requestVerificationCode = async () => {
    try {
      const response = await RefreshToken.post("/sms/request", {
        customerId: localStorage.getItem("customerId"),
        customer_name,
        telecom,
        customer_phone_number,
      });
      if (response.status === 200) {
        alert("인증번호가 전송되었습니다.");
        setStep("verify");
      } else {
        alert("인증번호 요청에 실패했습니다.");
      }
    } catch (error) {
      console.error("인증번호 요청 에러:", error);
      alert("고객정보와 입력한정보가 일치하지않습니다.");
      setPhoneNumber("");
      setCustomer_name("");
    }
  };

  const verifyCode = async () => {
    try {
      const response = await RefreshToken.post("/sms/verify", {
        customer_phone_number,
        code: verificationCode,
      });
      if (response.status === 200) {
        alert("인증이 완료되었습니다.");
        onVerified();
        onRequestClose();
      } else {
        alert("인증번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("인증번호 확인 에러:", error);
      alert("인증번호 확인 중 오류가 발생했습니다.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="SMS Verification"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          width: "500px",
          padding: "20px",
        },
      }}
    >
      {step === "request" ? (
        <div className="modalArea">
          <h2>휴대폰 본인 인증</h2>
          <div className="labelContainer">
            <label>고객 이름</label>
            <input
              type="text"
              value={customer_name}
              onChange={(e) => setCustomer_name(e.target.value)}
              placeholder="이름 입력"
            />
          </div>
          <div className="labelContainer">
            <label>통신사</label>
            <select
              value={telecom}
              onChange={(e) => setTelecom(e.target.value)}
            >
              <option value="">선택하세요</option>
              <option value="SKT">SKT</option>
              <option value="KT">KT</option>
              <option value="LG">LG</option>
              <option value="SKT 알뜰폰">SKT 알뜰폰</option>
              <option value="KT 알뜰폰">KT 알뜰폰</option>
              <option value="LG 알뜰폰">LG 알뜰폰</option>
            </select>
          </div>
          <div className="labelContainer">
            <label>전화번호</label>
            <input
              type="text"
              value={customer_phone_number}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="전화번호 입력 '-' 제외 "
            />
          </div>
        </div>
      ) : (
        <div className="modalArea">
          <h2>인증번호 입력</h2>
          <div className="labelContainer">
            <label>인증번호</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="인증번호 입력"
            />
          </div>
        </div>
      )}

      {/* 버튼 컨테이너 */}
      <div className="buttonContainer">
        {step === "request" ? (
          <button className="modalBtn" onClick={requestVerificationCode}>
            인증번호 요청
          </button>
        ) : (
          <button className="modalBtn" onClick={verifyCode}>
            인증번호 확인
          </button>
        )}
        <button className="modalBtn" onClick={onRequestClose}>
          닫기
        </button>
      </div>
    </Modal>
  );
};

export default SMSVerificationModal;
