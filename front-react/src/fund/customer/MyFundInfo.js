import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";
import FundCustomer from "../admin/FundCustomer";
import { Chart } from "react-google-charts";
import Papa from "papaparse";

const MyFundInfo = () => {
  const navigate = useNavigate();
  const [approvedTransactions, setApprovedTransactions] = useState([]);
  const [fundRates, setFundRates] = useState({});
  const [summary, setSummary] = useState({ totalInvested: 0, totalRate: 0 });
  const [chartData, setChartData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }

    const customerId = localStorage.getItem("customerId");
    fetchApprovedTransactions(customerId);
    parseFundRates();
  }, []);

  const fetchApprovedTransactions = async (customerId) => {
    try {
      const res = await RefreshToken.get(`/fundTrade/buy-approve/${customerId}`);
      setApprovedTransactions(res.data);
    } catch (error) {
      console.error("거래내역 조회 실패", error);
    }
  };

  const parseFundRates = () => {
    Papa.parse("/data/fundList_updated.csv", {
      header: true,
      download: true,
      complete: (results) => {
        const map = {};
        results.data.forEach((row) => {
          const name = row.fund_name?.trim();
          if (name) {
            map[name] = {
              return_1m: parseFloat(row.return_1m || 0),
              return_3m: parseFloat(row.return_3m || 0),
              return_6m: parseFloat(row.return_6m || 0),
              return_12m: parseFloat(row.return_12m || 0),
            };
          }
        });
        setFundRates(map);
      },
    });
  };

  // ✅ 수익률 시계열 데이터 구성
  useEffect(() => {
    console.log("📦 승인된 거래 목록:", approvedTransactions);
    if (!approvedTransactions.length || !Object.keys(fundRates).length) return;

    const headers = ["기간"];
    const rows = {
      "1일차": [],
      "3일차": [],
      "6일차": [],
      "12일차": [],
    };

    let totalInvested = 0;
    let totalCurrent = 0;

    approvedTransactions.forEach((tx, idx) => {
      const name = tx.fund_name?.trim() || `펀드${idx + 1}`;
      const fund = fundRates[name];
      if (!fund) return;

      const invest = parseFloat(tx.fundInvestAmount || 0);
      const units = parseFloat(tx.fundUnitsPurchased || 0);
      const price = parseFloat(tx.fundPricePerUnit || 0);
      if (!price || !invest) return;

      headers.push(name);

      const getRate = (r) => price * (1 + r / 100);

      rows["1일차"].push(getRate(fund.return_1m));
      rows["3일차"].push(getRate(fund.return_3m));
      rows["6일차"].push(getRate(fund.return_6m));
      rows["12일차"].push(getRate(fund.return_12m));

      totalInvested += invest;
      totalCurrent += getRate(fund.return_12m) * units;
    });

    const data = [headers];
    for (const [label, values] of Object.entries(rows)) {
      data.push([label, ...values]);
    }
    setChartData(data);

    const rate = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
    setSummary({ totalInvested, totalRate: parseFloat(rate.toFixed(2)) });
  }, [approvedTransactions, fundRates]);

  const handleConfirm = () => navigate("/login");
  const handleCancel = () => navigate("/");

  return (
    <>
      {showModal && (
        <FundCustomer
          message="로그인이 필요한 서비스입니다."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <div className={styles.fundContainer}>
        <h2 className={styles.fundTitle}>내 펀드 수익 정산</h2>
        <p>총 투자금: {summary.totalInvested.toLocaleString()}원</p>
        <p>예상 수익률 (12개월 기준): {summary.totalRate}%</p> 
        {chartData.length > 1 && chartData[0].length > 1 ? (
          <Chart
            chartType="LineChart"
            data={chartData}
            options={{
              title: "펀드별 예상 수익률 변화",
              curveType: "function",
              legend: { position: "bottom" },
              hAxis: { title: "기간" },
              vAxis: { title: "가치 상승 (단가 기준)" },
            }}
            width="100%"
            height="400px"
          />
        ) : (
          <p>📉 차트를 그릴 수 있는 펀드 수익 데이터가 없습니다.</p>
        )}

      </div>
    </>
  );
};

export default MyFundInfo;
