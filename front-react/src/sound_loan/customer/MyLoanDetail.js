import React, { useState } from "react";
import MyLoanStatus from "./MyLoanStatus";
import "../../Css/loan/MyLoanDetail.css";
import MyInterest from "./MyInterest";
import MyLateInterest from "./MyLateInterest";

const MyLoanDetail = () => {
  const [selectedComponent, setSelectedComponent] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

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
        {selectedComponent === "status" && <MyLoanStatus key={refreshKey} />}
        {selectedComponent === "interest" && (
          <MyInterest key={refreshKey} /> // ✅ key 전달
        )}
        {selectedComponent === "late" && <MyLateInterest key={refreshKey} />}
      </div>
    </div>
  );
};

export default MyLoanDetail;
