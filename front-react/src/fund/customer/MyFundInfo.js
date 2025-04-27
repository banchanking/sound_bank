// ✅ MyFundInfo.js - 라인차트 컬럼수 에러 방지 전체 리팩토링 (중복 제거 + 검증 주석 포함)
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";
import { Chart } from "react-google-charts";
import Papa from "papaparse";

const MyFundInfo = () => {
  const navigate = useNavigate();
  const customer_id = localStorage.getItem("customerId");
  const [approvedTransactions, setApprovedTransactions] = useState([]);
  const [fundRates, setFundRates] = useState({});
  const [summary, setSummary] = useState({ totalInvested: 0, totalRate: 0 });
  const [chartData, setChartData] = useState([]);
  const [donutData, setDonutData] = useState([]);
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    if (!customer_id) {
      const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
      if (goLogin) navigate("/login");
      else navigate("/");
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

  useEffect(() => {
    if (!approvedTransactions.length || !Object.keys(fundRates).length) return;

    const headers = ["기간"];
    const rows = {
      "1개월": [],
      "3개월": [],
      "6개월": [],
      "12개월": [],
    };

    let totalInvested = 0;
    let totalCurrent = 0;
    const donut = [["항목", "금액"]];
    const bar = [["펀드명", "수익률"]];
    const addedNames = new Set();

    approvedTransactions.forEach((tx) => {
      const name = tx.fund_name?.trim();
      if (!name || addedNames.has(name)) return; // ✅ 중복 방지

      const fund = fundRates[name];
      if (!fund) return;

      const invest = parseFloat(tx.fundInvestAmount || 0);
      const units = parseFloat(tx.fundUnitsPurchased || 0);
      const price = parseFloat(tx.fundPricePerUnit || 0);
      if (!price || !invest) return;

      headers.push(name);
      addedNames.add(name); // ✅ 헤더와 데이터 모두 동일 기준으로 추가

      const getRate = (r) => price * (1 + r / 100);

      rows["1개월"].push(getRate(fund.return_1m));
      rows["3개월"].push(getRate(fund.return_3m));
      rows["6개월"].push(getRate(fund.return_6m));
      rows["12개월"].push(getRate(fund.return_12m));

      const evaluated = getRate(fund.return_12m) * units;
      totalInvested += invest;
      totalCurrent += evaluated;

      const rate = invest > 0 ? ((evaluated - invest) / invest) * 100 : 0;
      bar.push([name, parseFloat(rate.toFixed(2))]);
    });

    const data = [headers];
    for (const [label, values] of Object.entries(rows)) {
      if (values.length === headers.length - 1) {
        data.push([label, ...values]);
      }
    }
    setChartData(data);
    donut.push(["총 투자금", totalInvested]);
    donut.push(["총 평가금액", totalCurrent]);
    setDonutData(donut);
    setBarData(bar);

    const rate = totalInvested > 0 ? ((totalCurrent - totalInvested) / totalInvested) * 100 : 0;
    setSummary({ totalInvested, totalRate: parseFloat(rate.toFixed(2)) });
  }, [approvedTransactions, fundRates]);

  const handleDownload = () => {
    const csv = Papa.unparse(barData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "fund_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
      <div className={styles.fundContainer}>
        <h2 className={styles.fundTitle}>내 펀드 수익 분석</h2>
        <p>총 투자금: {summary.totalInvested.toLocaleString()}원</p>
        <p>예상 수익률 (12개월 기준): {summary.totalRate}%</p>

        {/* 📈 라인 차트 */}
        {chartData.length > 1 && chartData.every(r => r.length === chartData[0].length) ? (
          <Chart
            chartType="LineChart"
            data={chartData}
            options={{
              title: "펀드별 예상 단가 변화",
              curveType: "function",
              legend: { position: "bottom" },
              hAxis: { title: "기간" },
              vAxis: { title: "예상 단가" },
            }}
            width="100%"
            height="400px"
          />
        ) : (
          <p>📉 라인차트를 그릴 수 있는 데이터가 없습니다.</p>
        )}

        {/* 🍩 도넛 차트 */}
        {donutData.length > 1 && (
          <Chart
            chartType="PieChart"
            data={donutData}
            options={{
              title: "총 투자금 vs 평가금액",
              pieHole: 0.4,
              colors: ["#3182f6", "#34c38f"],
            }}
            width="100%"
            height="300px"
          />
        )}

        {/* 📊 바 차트 */}
        {barData.length > 1 && (
          <Chart
            chartType="ColumnChart"
            data={barData}
            options={{
              title: "펀드별 수익률 (%)",
              legend: { position: "none" },
              hAxis: { title: "펀드명" },
              vAxis: { title: "수익률 (%)" },
            }}
            width="100%"
            height="400px"
          />
        )}

        <button onClick={handleDownload} className={styles.fundbuttonGroup}>
          수익률 CSV 저장
        </button>
      </div>
  );
};

export default MyFundInfo;
