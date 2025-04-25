import React, { useState } from "react";
import Login from "./Login";
import AdminLogin from "../../Admin/AdminLogin";

const TotalLogin = () => {
  const [activeTab, setActiveTab] = useState("customer"); // 기본은 고객

  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <h2>SoundBank 로그인</h2>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveTab("customer")}>고객 로그인</button>
        <button
          onClick={() => setActiveTab("admin")}
          style={{ marginLeft: "10px" }}
        >
          관리자 로그인
        </button>
      </div>

      <div>
        {activeTab === "customer" && <Login />}
        {activeTab === "admin" && <AdminLogin />}
      </div>
    </div>
  );
};

export default TotalLogin;
