// 파일명: AdminExchangeRateManage.jsx
import React, { useEffect, useState } from "react";
import styles from "../../Css/exchange/AdminExchangeRateManage.module.css";
import RefreshToken from "../../jwt/RefreshToken";
import useExchangeRates from "../customer/useExchangeRates";

const AdminExchangeRateManage = () => {
  const [date, setDate] = useState("");
  const [editedRates, setEditedRates] = useState([]);
  const { rates, loading } = useExchangeRates(date);

  useEffect(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    const formatted = localDate.toISOString().split("T")[0];
    setDate(formatted);
  }, []);

  useEffect(() => {
    setEditedRates(rates);
  }, [rates]);

  const handleInputChange = (index, field, value) => {
    if (!/^\d*\.?\d{0,2}$/.test(value)) return;
    const updated = [...editedRates];
    updated[index] = { ...updated[index], [field]: value };
    setEditedRates(updated);
  };

  const handleSave = () => {
    const parsedRates = editedRates.map(rate => ({
      base_date: date,
      currency_code: rate.currency_code,
      fee_rate: parseFloat(rate.fee_rate)
    }));

    RefreshToken
      .put("http://localhost:8081/api/admin/updateRatesFee", parsedRates)
      .then(() => alert("환율 정보가 성공적으로 저장되었습니다."))
      .catch(() => alert("저장 실패. 다시 시도해주세요."));
  };

  return (
    <div className={styles.container}>
      <div className={styles.dateInput} style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem" }}>
        <label htmlFor="date" style={{ fontWeight: "bold" }}>날짜 선택:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" }}
        />
      </div>

      {loading ? (
        <p>💸 환율 정보를 불러오는 중입니다 💸</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>통화</th>
                <th className={styles.currencyNameCell}>통화명</th>
                <th>Buy Rate</th>
                <th>Sell Rate</th>
                <th>Base Rate</th>
                <th>Fee (%)</th>
              </tr>
            </thead>
            <tbody>
              {editedRates.map((item, idx) => (
                <tr key={item.currency_code}>
                  <td>{item.currency_code}</td>
                  <td className={styles.currencyNameCell}>{item.currency_name}</td>
                  <td>
                    <input
                      type="text"
                      className={styles.inputBox}
                      value={String(item.buy_rate)}
                      disabled
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className={styles.inputBox}
                      value={String(item.sell_rate)}
                      disabled
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className={styles.inputBox}
                      value={String(item.base_rate)}
                      disabled
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className={styles.inputBox}
                      value={String(item.fee_rate)}
                      onChange={(e) => handleInputChange(idx, "fee_rate", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.saveButtonWrapper}>
            <button onClick={handleSave} className={styles.saveButton}>저장</button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminExchangeRateManage;
