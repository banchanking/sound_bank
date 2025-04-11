import React, { useEffect, useState } from "react";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import { Chart } from "react-google-charts";
import styles from "../../Css/exchange/MyWallet.module.css";
import useExchangeRates from "./useExchangeRates";

const ExchangeWalletStatus = () => {
  const [wallet, setWallet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState("");
  const { rates } = useExchangeRates(date);
  const customer_id = getCustomerID();

  // 오늘 날짜 초기화
  useEffect(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    setDate(localDate.toISOString().split("T")[0]);
  }, []);

  // 지갑 데이터 로드
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await RefreshToken.get(`http://localhost:8081/api/exchange/myWallet/${customer_id}`);
        setWallet(response.data);
      } catch (error) {
        console.error("보유 외화 조회 실패", error);
        setError("지갑 조회 실패");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, [rates, customer_id]);

  if (isLoading) return <div className={styles.loading}>지갑 정보를 불러오는 중입니다...</div>;
  if (error) return <div className={styles.error}>지갑 정보 조회 실패: {error}</div>;

  // 수익률 계산용 차트 데이터 생성
  const profitChartData = wallet.map(item => {
    const rate = rates.find(r => r.currency_code === item.currency_code);
    if (!rate) return null;

    const currentRate = parseFloat(rate.buy_rate); // 현재 환율: buy_rate 사용
    const avgRate = item.average_rate ? parseFloat(item.average_rate) : 0;

    if (!avgRate || isNaN(currentRate) || avgRate === 0) return null;

    const profit = ((currentRate - avgRate) / avgRate * 100).toFixed(2);
    const color = profit >= 0 ? "#4CAF50" : "#f44336";

    return [item.currency_code, parseFloat(profit), color];
  }).filter(Boolean);

  const profitChart = [["통화", "수익률 (%)", { role: "style" }], ...profitChartData];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{customer_id} 회원님의 지갑현황</h1>

      <h2 className={styles.subtitle}>외화보유 잔액</h2>
      <table className={styles.table}>
        <thead>
          <tr className={styles.theadRow}>
            <th className={styles.th}>통화 코드</th>
            <th className={styles.th}>잔액</th>
          </tr>
        </thead>
        <tbody>
          {wallet.map((item, index) => (
            <tr key={index} className={styles.trBody}>
              <td className={styles.td}>{item.currency_code}</td>
              <td className={styles.td}>{Number(item.balance).toLocaleString()} {item.currency_code}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 보유 외화 비중 차트 */}
      {wallet.length > 0 && rates.length > 0 && (
        <div style={{ marginTop: "40px" }}>
          <h3>보유 외화 비중</h3>
          <Chart
            chartType="PieChart"
            width="100%"
            height="300px"
            data={[
              ["통화", "잔액"],
              ...wallet.map(w => [w.currency_code, parseFloat(w.balance)])
            ]}
            options={{
              pieHole: 0.5,
              is3D: false,
              legend: { position: "right" }
            }}
          />

          {/* 수익률 차트 */}
          <h3 style={{ marginTop: "40px" }}>📈 수익률 차트</h3>
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="300px"
            data={profitChart}
            options={{
              legend: "none",
              vAxis: { title: "수익률 (%)", format: "decimal" },
              hAxis: { title: "통화" }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ExchangeWalletStatus;
