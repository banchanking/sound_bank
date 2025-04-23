import React from 'react';
import '../Css/customer_center/BusinessHour.css';

const BusinessHour = () => {
  return (
    <div className="business-hour-container">
      <h2 className="title">이용안내</h2>

      <div className="tabs">
        <div className="tab active">이용시간 안내</div>
        <div className="tab">금리 안내</div>
        <div className="tab">수수료 안내</div>
        <div className="tab">ATM이용 안내</div>
      </div>

      <Section title="송금" rows={[
        { label: '당행 송금', time: '24시간' },
        { label: '타행', time: '24시간' },
        { label: '해외', time: '' },
      ]} />

      <Section title="이체" rows={[
        { label: '자동이체(등록)', time: '24시간' },
        { label: '간편이체 등록 계좌', time: '' },
      ]} />

      <Section title="대출" rows={[
        { label: '개설 (신청/조회)', time: '24시간(*)' },
        { label: '상환 (일부/전액)', time: '' },
      ]} />
    </div>
  );
};

const Section = ({ title, rows }) => (
  <div className="section">
    <h3>{title}</h3>
    <div className="table">
      <div className="row header">
        <div className="cell">구분</div>
        <div className="cell">이용시간</div>
      </div>
      {rows.map((row, i) => (
        <div className="row" key={i}>
          <div className="cell">{row.label}</div>
          <div className="cell time">{row.time}</div>
        </div>
      ))}
    </div>
  </div>
);

export default BusinessHour;
