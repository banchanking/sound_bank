import React from "react";
import "../Css/Deposit/TaxPreferenceManagement.css"; // CSS 파일 import

const TaxPreferenceManagement = () => {
  return (
    <div className="tax-preference-container">
      <h1 className="tax-preference-title">세금우대관리</h1>
      <div className="tax-preference-description">
        <h2>세금우대 상품 안내</h2>
        <ul>
          <li>
            <strong>비과세상품:</strong> 이자소득이나 배당소득에 대해서 세금이 없는 상품입니다.
          </li>
          <li>
            <strong>소득공제 예금상품:</strong> 연금저축을 통해 세액공제, 주택청약저축을 통해 소득공제가 가능합니다.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TaxPreferenceManagement;