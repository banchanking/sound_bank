import React, { useState } from "react";
import {
  setAuthToken,
  setCustomerID,
  setRefreshToken,
} from "../jwt/AxiosToken";
import "../Css/customer/Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({ customerId: "", customer_password: "" });
  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onLogin = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:8081/api/login.do", {
        customerId: form.customerId,
        customer_password: form.customer_password,
      })
      .then((res) => {
        setAuthToken(res.data.customer_token); // access token 저장
        setCustomerID(res.data.customerId); // 고객 ID 저장
        setRefreshToken(res.data.refresh_token); // refresh token 저장

        alert(res.data.customerId + "님 환영합니다.");
        navigate("/");
      })
      .catch((error) => {
        console.error("로그인 실패:", error);
        setAuthToken(null);
      });
  };

  return (
    <div className="login-wrap">
      <div className="login-container">
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
          <div className="login-buttons">
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

export default Login;
