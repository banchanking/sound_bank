import React, { useState } from "react";
import { setAuthToken, setCustomerID } from "../jwt/AxiosToken";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// CSS 모듈로 바꿔서 import합니다.
// 파일명: LoginPage.module.css (사뱅스타일로 만든 모듈)
import styles from "../Css/customer/Login.module.css";

const Login = () => {
  const [form, setForm] = useState({
    customerId: "",
    customer_password: "",
  });
  const navigate = useNavigate();

  // 입력값이 바뀔 때마다 form 상태 업데이트
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 로그인 버튼 눌렀을 때
  const onLogin = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8081/api/login.do", {
        customerId: form.customerId,
        customer_password: form.customer_password,
      })
      .then((res) => {
        // 토큰과 고객 ID 저장
        setAuthToken(res.data.customer_token);
        setCustomerID(res.data.customerId);

        alert(res.data.customerId + "님 환영합니다.");
        navigate("/"); // 메인 페이지로 이동
      })
      .catch((error) => {
        console.error("로그인 실패:", error);
        const msg = error.response?.data?.message;
        if (msg === "UnKnown user" || msg === "Invalid password") {
          alert("아이디 또는 비밀번호를 다시 확인하세요");
        } else if (msg === "signOut user") {
          alert("탈퇴된 고객입니다.");
        } else {
          alert("서버 오류가 발생했습니다");
        }
        setAuthToken(null);
      });
  };

  return (
    <div className={styles.loginPage_wrapper}>
      <div className={styles.loginPage_container}>
        <h1 className={styles.loginPage_title}>고객 로그인</h1>
        <form onSubmit={onLogin}>
          <div>
            <label className={styles.loginPage_label}>아이디</label>
            <input
              className={styles.loginPage_input}
              type="text"
              name="customerId"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className={styles.loginPage_label}>비밀번호</label>
            <input
              className={styles.loginPage_input}
              type="password"
              name="customer_password"
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.loginPage_buttons}>
            <button
              type="submit"
              className={`${styles.loginPage_button} ${styles.loginPage_buttonPrimary}`}
            >
              로그인
            </button>
            <button
              type="button"
              className={`${styles.loginPage_button} ${styles.loginPage_buttonSecondary}`}
              onClick={() => navigate("/join")}
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
