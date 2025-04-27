import React, { useEffect, useState } from 'react';
import { getCustomerID } from '../../jwt/AxiosToken';
import RefreshToken from '../../jwt/RefreshToken';
import styles from '../../Css/exchange/ExList.module.css';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 15;

const ExList = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const customer_id = getCustomerID();

  useEffect(() => {
    const transactionList = async () => {
      if (!customer_id) {
        const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
        if (goLogin) navigate("/login");
        else navigate("/");
        return;
      }
      try {
        const response = await RefreshToken.get(`/exchange/exchangeList/${customer_id}`);
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

  const isSameDate = (date1, date2) => (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );

  const isWithinPeriod = (dateString) => {
    if (!period || period === 'all') return true;
    const txDate = new Date(dateString.replace(" ", "T"));
    const today = new Date();
    const compareDate = new Date();

    switch (period) {
      case 'today':
        return isSameDate(today, txDate);
      case '1w':
        compareDate.setDate(today.getDate() - 7);
        return txDate >= compareDate;
      case '1m':
        compareDate.setMonth(today.getMonth() - 1);
        return txDate >= compareDate;
      case '6m':
        compareDate.setMonth(today.getMonth() - 6);
        return txDate >= compareDate;
      default:
        return true;
    }
  };

  const isWithinRange = (dateString) => {
    if (!startDate && !endDate) return true;
    const txDate = new Date(dateString.replace(" ", "T"));
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;
    return (!from || txDate >= from) && (!to || txDate <= to);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchType = filter === 'all' || tx.transaction_type === filter;
    const matchPeriod = !tx.exchange_transaction_date || isWithinPeriod(tx.exchange_transaction_date);
    const matchRange = isWithinRange(tx.exchange_transaction_date);
    return matchType && matchPeriod && matchRange;
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return <div>환전 내역을 불러오는 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>환전 내역 조회</h2>

      <div className={styles.filterSection}>
        <button onClick={() => setFilter('all')}>전체</button>
        <button onClick={() => setFilter('buy')}>구매 (Buy)</button>
        <button onClick={() => setFilter('sell')}>판매 (Sell)</button>
      </div>

      <div className={styles.periodButtons}>
        <button onClick={() => {
          setPeriod('all');
          setStartDate('');
          setEndDate('');
        }}>전체</button>
        <button onClick={() => {
          const today = new Date().toISOString().split('T')[0];
          setPeriod('today');
          setStartDate(today);
          setEndDate(today);
        }}>당일</button>
        <button onClick={() => {
          const date = new Date();
          const to = date.toISOString().split('T')[0];
          date.setDate(date.getDate() - 7);
          const from = date.toISOString().split('T')[0];
          setPeriod('1w');
          setStartDate(from);
          setEndDate(to);
        }}>1주일</button>
        <button onClick={() => {
          const date = new Date();
          const to = date.toISOString().split('T')[0];
          date.setMonth(date.getMonth() - 1);
          const from = date.toISOString().split('T')[0];
          setPeriod('1m');
          setStartDate(from);
          setEndDate(to);
        }}>1개월</button>
        <button onClick={() => {
          const date = new Date();
          const to = date.toISOString().split('T')[0];
          date.setMonth(date.getMonth() - 6);
          const from = date.toISOString().split('T')[0];
          setPeriod('6m');
          setStartDate(from);
          setEndDate(to);
        }}>6개월</button>
      </div>

      <div className={styles.dateRangeSection}>
        <label>시작일: </label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label>종료일: </label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

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
          {paginatedTransactions.length === 0 ? (
            <tr>
              <td colSpan="4" className={styles.noData}>환전 내역이 없습니다.</td>
            </tr>
          ) : (
            paginatedTransactions.map((tx, index) => (
              <tr key={index}>
                <td className={styles.td}>
                  {tx.exchange_transaction_date
                    ? new Date(tx.exchange_transaction_date.replace(" ", "T")).toLocaleString('ko-KR')
                    : "거래 시간 없음"}
                </td>
                <td className={styles.td}>
                  {tx.request_amount?.toLocaleString()} {tx.from_currency}
                </td>
                <td className={styles.td}>
                  {tx.exchanged_amount?.toLocaleString()} {tx.to_currency}
                </td>
                <td className={styles.td}>{tx.transaction_type}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className={styles.pagination} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <button className={styles.exListBtn} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          ◀ 이전
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button className={styles.exListBtn} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          다음 ▶
        </button>
      </div>
    </div>
  );
};

export default ExList;
