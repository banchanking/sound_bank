import React from "react";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import { useEffect, useState } from "react";
import styles from "../../Css/exchange/MyWallet.module.css";
import { Chart } from "react-google-charts";
import useExchangeRates from "./useExchangeRates";

const ExchangeWalletStatus = () => {
  const [wallet, setWallet] = useState([]);            // 보유 외화 리스트
  const [isLoading, setIsLoading] = useState(true);    // 로딩 상태
  const [error, setError] = useState(null);            // 에러 처리
  const [date, setDate] = useState("");            // 날짜 상태
  const {rates} = useExchangeRates(date); // 현재 날짜의 환율 정보
  const customer_id = getCustomerID();

    // 초기 날짜 설정
    useEffect(() => {
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localDate = new Date(today.getTime() - offset * 60 * 1000);
      setDate(localDate.toISOString().split("T")[0]);
    }, []);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await RefreshToken.get(`http://localhost:8081/api/exchange/myWallet/${customer_id}`);
        console.log("응답 결과:", response);
        setWallet(response.data);
        console.log("보유 외화 조회 성공", response.data);
      } catch (error) {
        console.error("보유 외화 조회 실패", error);
        setError("보유 외화 조회 실패");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();
  }, [rates, customer_id]);

  if (isLoading) return <div className={styles.loading}>지갑 정보를 불러오는 중입니다...</div>;
  if (error) return <div className={styles.error}>지갑 정보 조회 실패: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {customer_id} 회원님의 지갑현황
      </h1>

      <h2 className={styles.subtitle}>
        외화보유 잔액
      </h2>

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

          <h3 style={{ marginTop: "40px" }}>📈 수익률 차트</h3>
          <Chart
            chartType="ColumnChart"
            width="100%"
            height="300px"
            data={(() => {
              const chartRows = wallet.map(wallet => {
              const rate = rates.find(r => r.currency_code === wallet.currency_code);
                if (!rate) return null;

                const currentRate = rate.base_rate ?? 0;
                const avgRate = wallet.average_rate ? parseFloat(wallet.average_rate) : currentRate;
                const profit = (currentRate - avgRate) / avgRate * 100;

                if (
                  isNaN(currentRate) ||
                  isNaN(avgRate) ||
                  avgRate === 0 ||
                  typeof wallet.currency_code !== 'string'
                ) return null;

               
                const color = profit >= 0 ? "#4CAF50" : "#f44336";

                return [wallet.currency_code, profit, color];
              }).filter(Boolean);
              return [["통화", "수익률 (%)", { role: "style" }], ...chartRows];
            })()}
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
