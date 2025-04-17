import React from "react";
import "../Css/Deposit/Precautions.css"; // CSS 파일 import

const Precautions = () => {
  const precautionsList = [
    { title: "거래방법", content: "인터넷, 모바일, 영업점, 전화신규를 통해 거래 가능합니다." },
    { title: "예금유의사항", content: "중도해지 시 약정된 금리보다 낮은 금리가 적용될 수 있습니다." },
    { title: "기타안내", content: "상품 가입 시 약관을 반드시 확인하시기 바랍니다." },
    { title: "세제혜택", content: "비과세 혜택은 관련 법령에 따라 적용됩니다." },
    { title: "예금자보호여부", content: "이 예금은 예금자보호법에 따라 보호됩니다." },
    { title: "상품내용 변경에 관한 사항", content: "상품 내용은 사전 고지 후 변경될 수 있습니다." },
  ];

  return (
    <div className="precautions-container">
      <h1 className="precautions-title">유의사항</h1>      
      <table className="precautions-table">
        <thead>
          <tr>
            <th>항목</th>
            <th>내용</th>
          </tr>
        </thead>
        <tbody>
          {precautionsList.map((item, index) => (
            <tr key={index}>
              <td>{item.title}</td>
              <td>{item.content}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Precautions;