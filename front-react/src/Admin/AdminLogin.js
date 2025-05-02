import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminAxios from "../jwt/AdminAxios";
import { setAuthToken, setCustomerID, setRole } from "../jwt/AxiosToken";
// CSS 모듈로 바꿔서 import합니다.
import styles from "../Css/admin/adminLogin.module.css";

const AdminLogin = () => {
  const [admin, setAdmin] = useState({
    customerId: "",
    password: "",
  });
  const navigate = useNavigate();

  // 입력값 변화 처리
  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  // 로그인 요청
  const onLogin = (e) => {
    e.preventDefault();

    AdminAxios.post("/login", {
      customerId: admin.customerId,
      password: admin.password,
    })
      .then((res) => {
        setAuthToken(res.data.customer_token);
        setCustomerID(res.data.customerId);
        setRole(res.data.role);

        alert(res.data.customerId + "님 환영합니다.");
        navigate("/adminPage");
      })
      .catch((error) => {
        console.error("로그인 실패:", error);
        const msg = error.response?.data?.error || "서버 오류";

        if (msg.includes("존재하지 않는")) {
          alert("존재하지 않는 관리자 입니다.");
        } else if (msg.includes("비밀번호가 일치하지")) {
          alert("비밀번호가 일치하지 않습니다.");
        } else {
          alert("서버 오류가 발생했습니다");
        }

        setAuthToken(null);
      });
  };

  return (
    <div className={styles.adminLogin_wrapper}>
      <div className={styles.adminLogin_container}>
        <h1 className={styles.adminLogin_title}>관리자 로그인</h1>
        <form onSubmit={onLogin}>
          <div>
            <label className={styles.adminLogin_label}>아이디</label>
            <input
              className={styles.adminLogin_input}
              type="text"
              name="customerId"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className={styles.adminLogin_label}>비밀번호</label>
            <input
              className={styles.adminLogin_input}
              type="password"
              name="password"
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.adminLogin_buttons}>
            <button
              type="submit"
              className={`${styles.adminLogin_button} ${styles.adminLogin_buttonPrimary}`}
            >
              로그인
            </button>
            <button
              type="button"
              className={`${styles.adminLogin_button} ${styles.adminLogin_buttonSecondary}`}
              onClick={() => navigate("/")}
            >
              메인으로
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
