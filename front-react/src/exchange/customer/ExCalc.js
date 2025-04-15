import React, { useState, useEffect } from "react";
import styles from "../../Css/exchange/ExCalc.module.css";

const ExCalc = ({ isOpen, onClose, exchange }) => {
  const [amount, setAmount] = useState(0);
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);

  const getRate = (currencyCode) => { // 나라코드
    const item = exchange.find((item) => item.currency_code === currencyCode); // 선택한 통화의 코드를 환율에서 찾는다.
    return item ? item.base_rate : null;
  };

  const calculateExchange = () => {
    if (!fromCurrency || !toCurrency || !amount) {
      setConvertedAmount(null);   // 환전된 통화
      return;
    }

    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);

    if (fromRate && toRate) {
      const result = amount * (fromRate / toRate); // 계산결과 = 요청금액 * (from환율 / to환율)
      setConvertedAmount(result.toFixed(2)); // 소수점2자리로 끊는다.
    } else {
      setConvertedAmount(null);
    }
  };

  useEffect(() => {
    calculateExchange();
  }, [amount, fromCurrency, toCurrency]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>환율 계산기</h3>

        <div>
          <label>금액:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label>From:</label>
          <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
            <option value="">통화 선택</option>
            {exchange.map((item, index) => (
              <option key={index} value={item.currency_code}>
                {item.currency_code} - {item.currency_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>To:</label>
          <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
            <option value="">통화 선택</option>
            {exchange.map((item, index) => (
              <option key={index} value={item.currency_code}>
                {item.currency_code} - {item.currency_name}
              </option>
            ))}
          </select>
        </div>

        {convertedAmount !== null && (
          <div>
            <h4>결과:</h4>
            <p>
              {amount} {fromCurrency} = {convertedAmount} {toCurrency}
            </p>
          </div>
        )}

        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default ExCalc;
