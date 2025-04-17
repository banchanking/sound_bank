import React, { useEffect, useState, useRef } from 'react';
import { Chart } from "react-google-charts";
import styles from "../../Css/fund/FundList.module.css";
import RefreshToken from "../../jwt/RefreshToken";

const FundList = () => {
  const [data, setData] = useState([]);
  const [funds, setFunds] = useState([]);
  const [selectedFunds, setSelectedFunds] = useState([]);
  const [expandedManagers, setExpandedManagers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const response = await RefreshToken.get("http://localhost:8081/api/registeredFunds");
        setFunds(response.data);
      } catch (error) {
        console.error("Error fetching registered funds:", error);
      }
    };
    fetchFunds();
  }, []);

  const handleFundClick = (fundName) => {
    setSelectedFunds(prev =>
      prev.includes(fundName) ? prev.filter(name => name !== fundName) : [...prev, fundName]
    );
    setShowPopup(true);
  };

  const handleManagerClick = (managerName) => {
    setExpandedManagers(prev =>
      prev.includes(managerName) ? prev.filter(name => name !== managerName) : [...prev, managerName]
    );
  };

  const handleCategoryChange = (e) => setSelectedCategory(e.target.value);

  const handleClosePopup = () => setShowPopup(false);

  useEffect(() => {
    if (selectedFunds.length > 0) {
      const chartData = [["기간", ...selectedFunds]];
      const periods = ["1개월", "3개월", "6개월", "12개월"];

      periods.forEach(period => {
        const row = [period];
        selectedFunds.forEach(fund => {
          const found = funds.find(f => f.fund_name === fund);
          const key = `return_${period.replace("개월", "m")}`;
          row.push(found ? parseFloat(found[key]) || 0 : 0);
        });
        chartData.push(row);
      });
      setData(chartData);
    } else {
      setData([]);
    }
  }, [selectedFunds, funds]);

  const groupedFunds = funds.reduce((acc, fund) => {
    if (!acc[fund.fund_company]) acc[fund.fund_company] = {};
    if (!acc[fund.fund_company][fund.fund_type]) acc[fund.fund_company][fund.fund_type] = [];
    acc[fund.fund_company][fund.fund_type].push(fund);
    return acc;
  }, {});

  return (
    <div className={styles.fundContainer}>
      <main>
        <div className={styles.fundListSection}>
          {Object.keys(groupedFunds).map((manager, i) => (
            <div key={i} className={styles.managerBlock}>
              <button className={styles.managerButton} onClick={() => handleManagerClick(manager)}>
                {manager}
              </button>
              {expandedManagers.includes(manager) && (
                <div>
                  <select className={styles.categorySelect} onChange={handleCategoryChange} value={selectedCategory}>
                    <option value="">펀드 유형 선택</option>
                    {Object.keys(groupedFunds[manager]).map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {selectedCategory && groupedFunds[manager][selectedCategory] && (
                    <table className={styles.fundTable}>
                      <thead>
                        <tr>
                          <th>상품명</th>
                          <th>1M</th>
                          <th>3M</th>
                          <th>6M</th>
                          <th>12M</th>
                          <th>등급</th>
                          <th>선취수수료</th>
                          <th>총보수</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedFunds[manager][selectedCategory].map((fund, idx) => (
                          <tr key={idx} onClick={() => handleFundClick(fund.fund_name)} className={selectedFunds.includes(fund.fund_name) ? styles.selected : ''}>
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
          <div className={styles.popupOverlay}>
            <div className={styles.popupChart} ref={popupRef}>
              <div className={styles.popupHeader}>
                <h3>수익률 비교</h3>
                <span className={styles.closeButton} onClick={handleClosePopup}>&times;</span>
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
                  colors: [
                    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
                    '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
                    '#bcbd22', '#17becf', '#393b79', '#637939',
                    '#8c6d31', '#843c39', '#7b4173', '#5254a3',
                    '#6b6ecf', '#9c9ede', '#e7ba52', '#bd9e39'
                  ]
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
