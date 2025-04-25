import React, { useState } from 'react';
import styles from '../Css/customer_center/BusinessHour.module.css'; // CSS 모듈 import

const tabData = {
  이용시간: [
    {
      title: '송금',
      rows: [
        { label: '당행 송금', time: '24시간' },
        { label: '타행', time: '24시간' },
        { label: '해외', time: '-' },
      ]
    },
    {
      title: '이체',
      rows: [
        { label: '자동이체(등록)', time: '24시간' },
        { label: '간편이체 등록 계좌', time: '-' },
      ]
    },
    {
      title: '대출',
      rows: [
        { label: '개설 (신청/조회)', time: '24시간(*)' },
        { label: '상환 (일부/전액)', time: '-' },
      ]
    }
  ],
  금리: [
    {
      title: '예금',
      rows: [
        { label: '정기예금 1개월', time: '2.55' },
        { label: '정기예금 2개월', time: '2.55' },
        { label: '정기예금 3개월', time: '2.45' },
      ]
    },
    {
      title: '적금',
      rows: [
        { label: '정기적금 6개월', time: '2.55' },
        { label: '정기적금 12개월', time: '2.45' },
        { label: '정기적금 24개월', time: '2.25' },
      ]
    }
  ],
  수수료: [
    {
      title: '송금',
      rows: [
        { label: '계좌이체(타행)', time: '무료' },
        { label: '기타이체', time: '무료' },
        { label: '세금/보험료', time: '무료' },
        { label: '지로/공과금', time: '무료' },
        { label: '기타 납부서비스', time: '무료' },
        { label: '환율 계산기', time: '무료' },
        { label: '고객센터 이용', time: '무료' },
      ]
    },
    {
      title: '이체',
      rows: [
        { label: '즉시이체/예약이체 (타행)', time: '유료' },
        { label: '다건 이체 수수료(타행)', time: '유료' },
      ]
    },
    {
      title: '대출',
      rows: [
        { label: '내게맞는대출', time: '무료' },
        { label: '대출조회', time: '무료' },
        { label: '대출이자납부', time: '무료' },
        { label: '대출상환(일부/전액)', time: '무료' },
        { label: '대출신청(사전심사)', time: '무료' },
        { label: '대출서류제출', time: '무료' },
        { label: '전자약정', time: '무료' },
        { label: '등기/근저당설정', time: '유료' },
      ]
    },
    {
      title: '카드',
      rows: [
        { label: '체크/신용카드 신청', time: '건당 300원 또는 건당 500원(카드종류)' },
        { label: '카드결제계좌 등록', time: '무료' },
        { label: '카드분실신고', time: '무료' },
        { label: '카드재발급', time: '유료(5,000원)' },
        { label: '해외결제차단/해제', time: '무료' },
        { label: '카드한도조회/변경', time: '무료' },
        { label: '이용내역조회', time: '무료' },
      ]
    },
    {
      title: '알림 서비스',
      rows: [
        { label: '입출금 알림', time: '무료' },
        { label: '카드승인 알림', time: '무료' },
      ]
    }
  ]
};

const BusinessHour = () => {
  const [activeTab, setActiveTab] = useState('이용시간');

  return (
    // 기존 클래스명: business-hour-container
    <div className={styles["business-hour-container"]}>
      {/* 기존 클래스명: title */}
      <h2 className={styles["title"]}>이용안내</h2>

      {/* 기존 클래스명: tabs */}
      <div className={styles["tabs"]}>
        {Object.keys(tabData).map(tab => (
          // 기존 클래스명: tab
          <div
            key={tab}
            className={`${styles["tab"]} ${activeTab === tab ? styles["active"] : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} 안내
          </div>
        ))}
      </div>

      {tabData[activeTab].map((section, idx) => (
        <Section key={idx} title={section.title} rows={section.rows} tab={activeTab} />
      ))}
    </div>
  );
};

const Section = ({ title, rows, tab }) => (
  // 기존 클래스명: section
  <div className={styles["section"]}>
    <h3>{title}</h3>

    {/* 기존 클래스명: table */}
    <div className={styles["table"]}>
      {/* 기존 클래스명: row header */}
      <div className={`${styles["row"]} ${styles["header"]}`}>
        <div className={styles["cell"]}>구분</div>
        <div className={styles["cell"]}>
          {tab === '금리' ? '금리(%)' : tab === '수수료' ? '수수료' : '이용시간'}
        </div>
      </div>
      {rows.map((row, i) => (
        // 기존 클래스명: row
        <div className={styles["row"]} key={i}>
          {/* 기존 클래스명: cell */}
          <div className={styles["cell"]}>{row.label}</div>
          {/* 기존 클래스명: time */}
          <div className={`${styles["cell"]} ${styles["time"]}`}>{row.time}</div>
        </div>
      ))}
    </div>
  </div>
);

export default BusinessHour;
