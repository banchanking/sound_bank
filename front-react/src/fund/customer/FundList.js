import React, { useEffect, useState, useRef } from 'react';
import { Chart } from 'react-google-charts';
import styles from "../../Css/fund/FundList.module.css"; // 스타일 파일 추가

const FundList = () => {
  const [data, setData] = useState([]);
  const [funds, setFunds] = useState([]); // 등록된 펀드 상품만 저장
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [expandedManagers, setExpandedManagers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:8081/api/registeredFunds')  // 등록된 펀드 상품 API 호출
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch registered funds');
      }
      return response.json();
    })
    .then((data) => {
      console.log('Registered Funds:', data); // 데이터 로드 확인
      setFunds(data); // 등록된 펀드 상품으로 상태 업데이트
    })
    .catch((error) => {
      console.error('Error fetching registered funds:', error);
    });
}, []);

  const handleFundClick = (fundName) => {
    setSelectedFunds(prevSelectedFunds => {
      if (prevSelectedFunds.includes(fundName)) {
        return prevSelectedFunds.filter(name => name !== fundName);
      } else {
        return [...prevSelectedFunds, fundName];
      }
    });
    setShowPopup(true);
  };

  const handleManagerClick = (managerName) => {
    setExpandedManagers(prevExpandedManagers => {
      if (prevExpandedManagers.includes(managerName)) {
        return prevExpandedManagers.filter((name) => name !== managerName);
      } else {
        return [...prevExpandedManagers, managerName];
      }
    });
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // 수정 =>  모달 전체 드래그 처리 (표 제외)
  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;

    const handleMouseDown = (e) => {
      const target = e.target;

      // 수정 =>  표 내부 클릭 시 드래그 막기
      if (
        target.tagName === 'TD' ||
        target.tagName === 'TH' ||
        target.closest('table')
      ) {
        return;
      }

      const shiftX = e.clientX - popup.getBoundingClientRect().left;
      const shiftY = e.clientY - popup.getBoundingClientRect().top;

      const moveAt = (clientX, clientY) => {
        popup.style.left = `${clientX - shiftX}px`;
        popup.style.top = `${clientY - shiftY}px`;
      };

      const onMouseMove = (e) => {
        moveAt(e.clientX, e.clientY);
      };

      document.addEventListener('mousemove', onMouseMove);

      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMouseMove);
      }, { once: true });
    };

    popup.addEventListener('mousedown', handleMouseDown);
    popup.ondragstart = () => false;

    return () => {
      popup.removeEventListener('mousedown', handleMouseDown);
    };
  }, [showPopup]);


  const handleClosePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    if (selectedFunds.length > 0) {
      const chartData = [
        ['기간', ...selectedFunds.map((fund) => `${fund} 수익률`)], // 헤더 생성
      ];

      const periods = ['1개월', '3개월', '6개월', '12개월'];
      periods.forEach((period) => {
        const row = [period]; // 첫 번째 열은 기간
        selectedFunds.forEach((fund) => {
          const fundData = funds.find((row) => row.fund_name === fund);
          const value = fundData ? parseFloat(fundData[`return_${period.replace('개월', 'm')}`]) : 0; // 값이 없으면 0으로 설정
          row.push(value);
        });
        chartData.push(row);
      });

      console.log('Chart Data:', chartData); // 차트 데이터 확인
      setData(chartData);
    } else {
      setData([]);
    }
  }, [selectedFunds, funds]);

  const groupedFunds = funds.reduce((acc, fund) => {
    if (!acc[fund.fund_company]) {
      acc[fund.fund_company] = {};
    }
    if (!acc[fund.fund_company][fund.fund_type]) {
      acc[fund.fund_company][fund.fund_type] = [];
    }
    acc[fund.fund_company][fund.fund_type].push(fund);
    return acc;
  }, {});

  return (
    <div className={styles.Fund}>
      <main>
        <div className={styles.fundlist}>
          {Object.keys(groupedFunds).map((manager, index) => (
            <div key={index}>
              <button onClick={() => handleManagerClick(manager)}>
                {manager}
              </button>
              {expandedManagers.includes(manager) && (
                <div>
                  <select onChange={handleCategoryChange} value={selectedCategory}>
                    <option value="">펀드 유형 선택</option>
                    {Object.keys(groupedFunds[manager]).map((category, catIndex) => (
                      <option key={catIndex} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {selectedCategory && groupedFunds[manager][selectedCategory] && (
                    <table>
                      <thead>
                        <tr>
                          <th>상품명</th>
                          <th>1개월 누적 수익률(%)</th>
                          <th>3개월 누적 수익률(%)</th>
                          <th>6개월 누적 수익률(%)</th>
                          <th>12개월 누적 수익률(%)</th>
                          <th>펀드 등급</th>
                          <th>선취 수수료(%)</th>
                          <th>총 보수(%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedFunds[manager][selectedCategory].map((fund, fundIndex) => (
                          <tr
                            key={fundIndex}
                            onClick={() => handleFundClick(fund.fund_name)}
                            className={selectedFunds.includes(fund.fund_name) ? 'selected' : ''}
                          >
                            <td>{fund.fund_name}</td>
                            <td>{fund.return_1m}</td>
                            <td>{fund.return_3m}</td>
                            <td>{fund.return_6m}</td>
                            <td>{fund.return_12m}</td>
                            <td>{fund.fund_grade}</td>
                            <td>{fund.fund_upfront_fee}</td>
                            <td>{fund.fund_fee_rate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {showPopup && (
          <div className={styles.popup} ref={popupRef}>
            <div className={styles.popupcontent}>
              <div className={styles.popupheader}>
                <h3>펀드 수익률 비교 차트</h3>
                <span className={styles.close} onClick={handleClosePopup}>&times;</span>
              </div>
              <Chart
                width={'100%'}
                height={'400px'}
                chartType="LineChart"
                loader={<div>Loading Chart...</div>}
                data={data}
                options={{
                  hAxis: {
                    title: '기간',
                  },
                  vAxis: {
                    title: '수익률 (%)',
                  },
                  legend: { position: 'bottom' },
                  colors: ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'] // 색상 설정
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FundList;