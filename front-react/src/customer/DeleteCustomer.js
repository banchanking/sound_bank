import React, { useState } from "react";
import RefreshToken from "../jwt/RefreshToken";
import "../Css/customer/DelectCustomer.css";

const DeleteCustomer = () => {
  const [customer_password, setPassword] = useState("");

  const handleDelete = () => {
    const customerId = localStorage.getItem("customerId");

    if (!customer_password) {
      alert("비밀번호를 입력해주세요!");
      return;
    }

    RefreshToken.post("/checkPassword", { customerId, customer_password })
      .then((res) => {
        if (res.data === true) {
          if (window.confirm("정말 회원 탈퇴하시겠습니까? 🥲")) {
            RefreshToken.post("/deleteCustomer", { customerId })
              .then((res) => {
                alert("회원탈퇴가 완료되었습니다. 감사합니다.");
                window.location.href = "/";
              })
              .catch((error) => {
                if (error.response && Array.isArray(error.response.data)) {
                  // 상품이 존재할 때
                  alert(
                    "탈퇴 불가: 가입된 상품이 존재합니다\n" +
                      error.response.data.join(", ")
                  );
                } else {
                  // 서버 자체 에러
                  console.error("탈퇴 실패:", error);
                  alert("회원탈퇴 처리 중 오류가 발생했습니다.");
                }
              });
          }
        } else {
          alert("비밀번호가 일치하지 않습니다.");
        }
      })
      .catch((error) => {
        console.error("비밀번호 확인 실패:", error);
        alert("비밀번호 확인 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="delete-customer-wrapper">
      <div className="delete-customer-container">
        <h2>회원 탈퇴</h2>
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={customer_password}
          onChange={(e) => setPassword(e.target.value)}
          className="delete-customer-input"
        />
        <button className="delete-customer-button" onClick={handleDelete}>
          회원 탈퇴
        </button>
      </div>
    </div>
  );
};

export default DeleteCustomer;
