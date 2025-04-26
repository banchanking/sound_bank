import React, { useEffect, useState } from "react";
import RefreshToken from "../jwt/RefreshToken";
import "../Css/customer/MyInfo.css"; // CSS 연결

const MyInfo = ({ onEdit }) => {
  const [myInfo, setMyInfo] = useState(null);

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    RefreshToken.get("/myInfoList", {
      params: { customerId },
    })
      .then((res) => {
        setMyInfo(res.data);
      })
      .catch((error) => {
        console.error("회원 정보 조회 실패:", error);
      });
  }, []);

  if (!myInfo) {
    return <div className="myinfo-container">로딩 중...</div>;
  }

  // 주민등록번호 가리기 함수
  const maskResidentNumber = (residentNumber) => {
    if (!residentNumber || residentNumber.length < 8) return residentNumber;
    return residentNumber.substring(0, 8) + "******";
  };

  return (
    <div className="myinfo-container">
      <h2 className="myinfo-title">회원 정보 조회</h2>
      <table className="myinfo-table">
        <tbody>
          <tr>
            <th>아이디</th>
            <td>{myInfo.customerId}</td>
          </tr>
          <tr>
            <th>이름</th>
            <td>{myInfo.customerName}</td>
          </tr>
          <tr>
            <th>이메일</th>
            <td>{myInfo.customer_email}</td>
          </tr>
          <tr>
            <th>전화번호</th>
            <td>{myInfo.customerPhoneNumber}</td>
          </tr>
          <tr>
            <th>주민등록번호</th>
            <td>{maskResidentNumber(myInfo.customer_resident_number)}</td>
          </tr>
          <tr>
            <th>주소</th>
            <td>{myInfo.customer_address}</td>
          </tr>
          <tr>
            <th>대표계좌번호</th>
            <td>{myInfo.customer_account_number}</td>
          </tr>
          <tr>
            <th>직업</th>
            <td>{myInfo.customer_job}</td>
          </tr>
          <tr>
            <th>투자성향</th>
            <td>{myInfo.customer_risk_type}</td>
          </tr>
        </tbody>
      </table>

      <div className="myinfo-button-container">
        <button className="myinfo-button" onClick={onEdit}>
          정보 수정
        </button>
      </div>
    </div>
  );
};

export default MyInfo;
