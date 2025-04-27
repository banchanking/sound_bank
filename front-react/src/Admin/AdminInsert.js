import React, { useState } from "react";
import "../Css/admin/AdminInsert.css"; // CSS 연결
import AdminAxios from "../jwt/AdminAxios";

const AdminInsert = ({ onBack }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    password: "",
    confirmPassword: "", // ✅ 비밀번호 확인 추가
    name: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    console.log("관리자 등록 요청 데이터:", formData);

    AdminAxios.post("/insert", formData)
      .then((res) => {
        alert(res.data); // 서버가 success 시 보내준 메세지
        onBack();
      })
      .catch((error) => {
        console.error(error.data);

        // ✅ 에러 처리 로직
        if (error.response) {
          // 서버가 응답했는데 에러인 경우 (ex. 401, 400 등)
          alert(error.response.data || "요청 실패");
        } else if (error.request) {
          // 요청은 갔는데 응답이 없는 경우
          alert("서버로부터 응답이 없습니다.");
        } else {
          // 요청 보내기도 전에 오류가 발생한 경우
          alert("요청 설정 중 오류 발생");
        }
      });
  };

  const isPasswordMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;
  const isPasswordMismatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword;

  return (
    <div className="adminInsert-container">
      <h2 className="adminInsert-title">관리자 등록</h2>
      <form onSubmit={handleSubmit} className="adminInsert-form">
        <div className="adminInsert-form-group">
          <label>아이디</label>
          <input
            type="text"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="adminInsert-form-group">
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="adminInsert-form-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {/* 비밀번호 비교 결과 표시 */}
          {isPasswordMismatch && (
            <p className="password-check-text mismatch">비밀번호가 다릅니다.</p>
          )}
          {isPasswordMatch && (
            <p className="password-check-text match">비밀번호가 일치합니다.</p>
          )}
        </div>

        <div className="adminInsert-form-group">
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="adminInsert-submit-button">
          등록하기
        </button>
      </form>
    </div>
  );
};

export default AdminInsert;
