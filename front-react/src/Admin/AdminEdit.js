import React, { useState, useEffect } from "react";
import "../Css/admin/AdminEdit.css"; // 수정용 CSS 별도
import AdminAxios from "../jwt/AdminAxios";

const AdminEdit = ({ selectedAdmin, onBack }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (selectedAdmin) {
      setFormData({
        customerId: selectedAdmin.customerId,
        name: selectedAdmin.name,
        password: "",
        confirmPassword: "",
      });
    }
  }, [selectedAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!window.confirm("수정하시겠습니까?")) return;

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    AdminAxios.post("/update", {
      customerId: formData.customerId,
      name: formData.name,
      password: formData.password,
    })
      .then((res) => {
        alert(res.data);
        onBack(); // 수정 완료 후 목록으로 돌아가기
      })
      .catch((err) => {
        console.error(err);
        alert("수정 실패");
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
    <div className="adminEdit-container">
      <h2 className="adminEdit-title">👨‍💼 관리자 정보 수정</h2>
      <form onSubmit={handleSubmit} className="adminEdit-form">
        <div className="adminEdit-form-group">
          <label>아이디</label>
          <input
            type="text"
            name="customerId"
            value={formData.customerId}
            readOnly
          />
        </div>

        <div className="adminEdit-form-group">
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="adminEdit-form-group">
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="변경할 비밀번호 입력"
            required
          />
        </div>

        <div className="adminEdit-form-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호 다시 입력"
            required
          />
          {/* ✅ 비밀번호 일치 여부 출력 */}
          {isPasswordMismatch && (
            <p className="password-check-text mismatch">비밀번호가 다릅니다.</p>
          )}
          {isPasswordMatch && (
            <p className="password-check-text match">비밀번호가 일치합니다.</p>
          )}
        </div>

        <div className="adminEdit-buttons">
          <button type="submit">수정완료</button>
          <button type="button" onClick={onBack}>
            돌아가기
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEdit;
