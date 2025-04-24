import React, { useEffect, useState } from "react";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import { Chart } from "react-google-charts";
import styles from "../../Css/exchange/MyWallet.module.css";
import useExchangeRates from "./useExchangeRates";
import { useNavigate } from 'react-router-dom';

const ExchangeWalletStatus = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState("");
  const { rates } = useExchangeRates(date);
  const customer_id = getCustomerID();
  const columns = [
    { type: "string", label: "통화" },
    { type: "number", label: "수익률 (%)" },
    { type: "string", role: "style" },
  ];

  // 오늘 날짜 초기화
  useEffect(() => {
    const id = getCustomerID();
    if (!id) {
      const customer_id = getCustomerID();
          if (!customer_id) {
            if (!customer_id) {
              const goLogin = window.confirm(
                "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
              );
              if (goLogin) {
                navigate("/login");
              }
              return;      
          }
        }
    }
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
        console.log(response)
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
  // 해당 통화의 현재 환율(=DB에서 normalize된 buy_rate·sell_rate)
  const rateData = rates.find(r => r.currency_code === item.currency_code);
  if (!rateData) return null;

  // 1) 내가 산 평균 단가 (SQL에서 가중평균으로 계산된 값)
  const purchaseRate = parseFloat(item.average_rate);
  // 2) 지금 내가 팔 때 적용받는 환율 (TTB → buy_rate)
  const sellRate     = parseFloat(rateData.buy_rate);

  // 유효성 체크
  if (!purchaseRate || isNaN(sellRate)) return null;

  // (지금 팔 때 가격 - 평균 매입가) / 평균 매입가 * 100
  const profitPercent = ((sellRate - purchaseRate) / purchaseRate) * 100;
  const profitFixed   = parseFloat(profitPercent.toFixed(2));

  // 상승: 초록, 하락: 빨강
  const color = profitPercent >= 0 ? "#4CAF50" : "#f44336";

  return [ item.currency_code, profitFixed, color ];
}).filter(Boolean);

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
            columns={columns}
            rows={profitChartData}
            options={{
              legend: "none",
              vAxis: { title: "수익률 (%)", format: "decimal" },
              hAxis: { title: "통화" },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ExchangeWalletStatus;
