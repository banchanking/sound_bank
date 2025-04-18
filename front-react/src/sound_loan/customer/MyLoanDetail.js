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

  // 자식 컴포넌트에게 내려줄 새로고침 트리거
  const refreshInterest = () => {
    setRefreshKey((prev) => prev + 1); // 🔥 key 변경 → 컴포넌트 리렌더링
  };

  return (
    <div className="totalArea">
      <div className="selectBtnArea">
        <button onClick={() => changeShow("status")}>나의 대출 현황</button>
        <button onClick={() => changeShow("interest")}>나의 납입 내역</button>
        <button onClick={() => changeShow("late")}>나의 연체 내역</button>
      </div>
      <div>
        {selectedComponent === "status" && (
          <MyLoanStatus key={refreshKey} onRefresh={refreshInterest} />
        )}
        {selectedComponent === "interest" && (
          <MyInterest key={refreshKey} onRefresh={refreshInterest} /> // ✅ key 전달
        )}
        {selectedComponent === "late" && (
          <MyLateInterest key={refreshKey} onRefresh={refreshInterest} />
        )}
      </div>
      <div>
        <p>나의 대출상태를 확인하고 관리 할 수 있습니다. </p>
        <p>중도 상환</p>
      </div>
    </div>
  );
};

export default MyLoanDetail;
