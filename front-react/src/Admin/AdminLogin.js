import React from "react";
import "../../Css/admin/adminLogin.css";

const AdminLogin = () => {
  const onLogin = () => {};

  const handleChange = () => {};

  return (
    <div className="adminLogin-wrap">
      <div className="adminLogin-container">
        <h1>로그인</h1>
        <form onSubmit={onLogin}>
          <div>
            <label>아이디</label>
            <input
              type="text"
              name="customerId"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>비밀번호</label>
            <input
              type="password"
              name="customer_password"
              onChange={handleChange}
              required
            />
          </div>
          <div className="adminLogin-buttons">
            <button type="submit">로그인</button>
            <button
              type="button"
              onClick={() => (window.location.href = "/join")}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
