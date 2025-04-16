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
  
  // 금액 입력 처리 함수 (콤마 포함된 상태로 입력 → 숫자로 변환 후 상태 저장)
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      const numberValue = Number(rawValue);
      setAmount(numberValue.toLocaleString());
    }
  };

  // 환율 계산 시 숫자만 추출해서 계산
  const calculateExchange = () => {
    if (!fromCurrency || !toCurrency || !amount) {
      setConvertedAmount(null);
      return;
    }

    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);
    const numericAmount = Number(amount.toString().replace(/,/g, ""));

    if (fromRate && toRate && numericAmount > 0) {
      const result = numericAmount * (fromRate / toRate);
      setConvertedAmount(result.toFixed(2));
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
            type="text" // 중요! type="number" → "text"로 바꿔야 콤마 표시 가능
            value={amount}
            onChange={handleAmountChange}
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
              {Number(amount.replace(/,/g, "")).toLocaleString()} {fromCurrency} ={" "}
              {Number(convertedAmount).toLocaleString()} {toCurrency}
            </p>
          </div>
        )}

        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default ExCalc;
