import React, { useState } from "react";
import MyLoanStatus from "./MyLoanStatus";
import "../../Css/loan/MyLoanDetail.css";
import MyInterest from "./MyInterest";
import MyLateInterest from "./MyLateInterest";

const MyLoanDetail = () => {
  const [selectedComponent, setSelectedComponent] = useState("");

  const changeShow = (componentName) => {
    setSelectedComponent(componentName);
  };

  return (
    <div className="totalArea">
      <div className="selectBtnArea">
        <button onClick={() => changeShow("status")}>나의 대출 현황</button>
        <button onClick={() => changeShow("interest")}>나의 납입 내역</button>
        <button onClick={() => changeShow("late")}>나의 연체 내역</button>
      </div>
      <div>
        {selectedComponent === "status" && <MyLoanStatus />}
        {selectedComponent === "interest" && <MyInterest />}
        {selectedComponent === "late" && <MyLateInterest />}
      </div>
      <div>
        <p>나의 대출상태를 확인하고 관리 할 수 있습니다. </p>
        <p>중도 상환</p>
      </div>
    </div>
  );
};

export default MyLoanDetail;
