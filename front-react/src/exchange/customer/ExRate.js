import React, { useEffect, useState } from "react";
import styles from "../../Css/exchange/ExRate.module.css";
import ExCalc from "./ExCalc";
import useExchangeRates from "./useExchangeRates";

const ExRate = () => {
  const [date, setDate] = useState("");
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // 초기 날짜 설정
  useEffect(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    setDate(localDate.toISOString().split("T")[0]);
  }, []);

  const { rates, loading } = useExchangeRates(date);

  // 날짜 변경 핸들러
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.calcButtonWrapper}>
        <button className={styles.calcButton} onClick={() => setIsCalculatorOpen(true)}>
          환율 계산기 열기
        </button>
      </div>

      {/* 날짜 입력 필드 */}
      <div className={styles.dateInput}>
        <label htmlFor="date">날짜 선택: </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={handleDateChange}
        />
        <h5> * 영업일 11시 전후로 업데이트 됩니다 </h5>
        <h5> * 주말&공휴일 환율은 조회되지 않습니다. </h5>
      </div>

      {/* 환율 계산기 팝업 */}
      <ExCalc
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        exchange={rates}
      />

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "20px", minHeight: "570px" }}>
          💸 환율 정보를 불러오는 중입니다 💸
        </p>
      ) : (
        <table border="1" className={styles.table}>
          <thead>
            <tr>
              <th>통화 코드</th>
              <th>국가/통화명</th>
              <th>전신환(송금) 받으실 때</th>
              <th>전신환(송금) 보내실 때</th>
              <th>매매 기준율</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((item, index) => (
              <tr key={index}>
                <td>{item.currency_code}</td>
                <td>{item.currency_name}</td>
                <td>{item.sell_rate}</td>
                <td>{item.buy_rate}</td>
                <td>{item.base_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExRate;