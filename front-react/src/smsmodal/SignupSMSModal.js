import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import RefreshToken from "../jwt/RefreshToken";
import "../Css/customer/JoinModal.module.css";

Modal.setAppElement("#root");

const SignupSMSModal = ({ isOpen, onRequestClose, onVerified, phoneNumber }) => {
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setVerificationCode("");
    }
  }, [isOpen]);

  const sendVerificationCode = async () => {
    try {
      const res = await RefreshToken.post("/sms/signup/request", {
        customer_phone_number: phoneNumber,
      });

      if (res.status === 200) {
        alert("인증번호가 전송되었습니다.");
      } else {
        alert("인증번호 전송 실패");
      }
    } catch (err) {
      console.error("인증 요청 에러:", err);
      alert("서버 오류 또는 잘못된 번호입니다.");
    }
  };

  const verifyCode = async () => {
    try {
      const res = await RefreshToken.post("/sms/signup/verify", {
        customer_phone_number: phoneNumber,
        code: verificationCode,
      });
  
      if (res.status === 200 && res.data === true) {
        alert("인증 성공");
        onVerified();
        onRequestClose();
      } else {
        alert("인증번호가 일치하지 않습니다.");
      }
    } catch (err) {
      console.error("인증 확인 오류:", err);
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="휴대폰 인증"
      style={{
        content: {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
        },
      }}
    >
      <div className="modalArea">
        <h2>인증번호 입력</h2>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="인증번호 입력"
        />
      </div>
      <div className="buttonContainer">
        <button onClick={verifyCode}>인증확인</button>
        <button onClick={onRequestClose}>닫기</button>
      </div>
    </Modal>
  );
};

export default SignupSMSModal;
