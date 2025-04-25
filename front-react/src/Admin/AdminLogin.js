import React, { useState } from "react";
import "../Css/admin/adminLogin.css";
import AdminAxios from "../jwt/AdminAxios";
import { useNavigate } from "react-router-dom";
import { setAuthToken, setCustomerID, setRole } from "../jwt/AxiosToken";

const AdminLogin = () => {
  const [admin, setAdmin] = useState({
    customerId: "",
    password: "",
  });

  const navigate = useNavigate();

  const onLogin = (e) => {
    e.preventDefault();
    AdminAxios.post("/login", {
      customerId: admin.customerId,
      password: admin.password,
    })
      .then((res) => {
        setAuthToken(res.data.admin_token); // access token 저장
        setCustomerID(res.data.customerId); //  ID 저장
        setRole(res.data.role);

        alert(res.data.customerId + "님 환영합니다.");
        navigate("/adminPage");
      })
      .catch((error) => {
        console.error("로그인 실패:", error);

        const msg = error.response?.data?.message || "서버 오류";

        if (msg === "UnKnown user" || msg === "Invalid password") {
          alert("아이디 또는 비밀번호를 다시 확인하세요");
        } else {
          alert("서버 오류가 발생했습니다");
        }
        setAuthToken(null);
      });
  };

  const handleChange = (e) => {
    setAdmin({
      ...admin,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="adminLogin-wrap">
      <div className="adminLogin-container">
        <h1>관리자 로그인</h1>
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
              name="password"
              onChange={handleChange}
              required
            />
          </div>
          <div className="adminLogin-buttons">
            <button type="submit">로그인</button>
            <button type="button" onClick={() => (window.location.href = "/")}>
              메인으로
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
