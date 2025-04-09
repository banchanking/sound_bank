import React, { useEffect, useState } from 'react';
import { getCustomerID } from '../../jwt/AxiosToken';
import RefreshToken from '../../jwt/RefreshToken';
import styles from '../../Css/exchange/ExList.module.css';

const ExList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const customer_id = getCustomerID();

  useEffect(() => {
    const transactionList = async () => {
      try {
        const response = await RefreshToken.get(`http://localhost:8081/api/exchange/exchangeList/${customer_id}`);
        setTransactions(response.data);
      } catch (error) {
        console.error("환전내역 조회 실패", error);
        setError('환전 내역을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    transactionList();
  }, [customer_id]);

  if (loading) return <div>환전 내역을 불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>환전 내역</h2>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>거래 일시</th>
            <th className={styles.th}>요청 금액</th>
            <th className={styles.th}>환전 금액</th>
            <th className={styles.th}>거래유형</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="3" className={styles.noData}>환전 내역이 없습니다.</td>
            </tr>
          ) : (
            transactions.map((tx, index) => (
              <tr key={index}>
                <td className={styles.td}>
                  {new Date(tx.exchange_transaction_date.replace(' ', 'T')).toLocaleString('ko-KR')}
                </td>
                <td className={styles.td}>{tx.request_amount.toLocaleString()}원</td>
                <td className={styles.td}>{tx.exchanged_amount.toLocaleString()}{tx.currency_code}</td>
                <td className={styles.td}>{tx.transaction_type}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExList;
