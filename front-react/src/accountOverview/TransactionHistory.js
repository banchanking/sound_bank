import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // useNavigate 추가

const TransactionHistory = () => {
  const location = useLocation();
  const navigate = useNavigate(); // useNavigate 훅 사용
  const { accountNumber } = location.state || {}; // 전달받은 계좌번호
  const [selectedAccount, setSelectedAccount] = useState(accountNumber || ''); // 기본 선택 계좌번호

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [transactionType, setTransactionType] = useState('전체내역');
  const [sortOrder, setSortOrder] = useState('최근거래순');
  const [transactions, setTransactions] = useState([]);

  const handleQuickDateRange = (range) => {
    const today = new Date();
    let start = new Date();

    switch (range) {
      case '오늘':
        start = today;
        break;
      case '1주일':
        start.setDate(today.getDate() - 7);
        break;
      case '15일':
        start.setDate(today.getDate() - 15);
        break;
      case '1개월':
        start.setMonth(today.getMonth() - 1);
        break;
      case '3개월':
        start.setMonth(today.getMonth() - 3);
        break;
      default:
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/transactionHistory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountNumber: selectedAccount, // 선택된 계좌번호로 조회
          startDate,
          endDate,
          year,
          month,
          transactionType,
          sortOrder,
        }),
      });
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  // 즉시이체 버튼 클릭 시 DepositWithdrawal 화면으로 이동
  const handleImmediateTransfer = () => {
    navigate('/depositWithdrawal', { state: { accountNumbers: [selectedAccount], selectedAccount } }); // 전체 계좌 목록과 선택된 계좌 전달
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>거래내역 조회</h1>

      {/* 조회계좌번호 */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>조회계좌번호:</label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          style={{
            border: '1px solid #ccc',
            padding: '5px',
            borderRadius: '4px',
            width: '300px',
          }}
        >
            <option value={accountNumber}>{accountNumber}
            </option>
        
        </select>
      </div>

      {/* 조회기간 */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>조회기간:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', borderRadius: '4px' }}
        />
        ~
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginLeft: '10px', marginRight: '20px', padding: '5px', borderRadius: '4px' }}
        />
        <button onClick={() => handleQuickDateRange('오늘')} style={{ marginRight: '5px' }}>
          오늘
        </button>
        <button onClick={() => handleQuickDateRange('1주일')} style={{ marginRight: '5px' }}>
          1주일
        </button>
        <button onClick={() => handleQuickDateRange('15일')} style={{ marginRight: '5px' }}>
          15일
        </button>
        <button onClick={() => handleQuickDateRange('1개월')} style={{ marginRight: '5px' }}>
          1개월
        </button>
        <button onClick={() => handleQuickDateRange('3개월')}>3개월</button>
      </div>

      {/* 월별 조회 */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>월별 조회:</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ marginRight: '10px', padding: '5px', borderRadius: '4px' }}
        >
          <option value="">년 선택</option>
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{ padding: '5px', borderRadius: '4px' }}
        >
          <option value="">월 선택</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}월
            </option>
          ))}
        </select>
      </div>

      {/* 조회내용 및 정렬순서 */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>조회내용:</label>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            name="transactionType"
            value="전체내역"
            checked={transactionType === '전체내역'}
            onChange={(e) => setTransactionType(e.target.value)}
          />
          전체내역
        </label>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            name="transactionType"
            value="입금내역"
            checked={transactionType === '입금내역'}
            onChange={(e) => setTransactionType(e.target.value)}
          />
          입금내역
        </label>
        <label>
          <input
            type="radio"
            name="transactionType"
            value="출금내역"
            checked={transactionType === '출금내역'}
            onChange={(e) => setTransactionType(e.target.value)}
          />
          출금내역
        </label>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>정렬순서:</label>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            name="sortOrder"
            value="최근거래순"
            checked={sortOrder === '최근거래순'}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          최근거래순
        </label>
        <label>
          <input
            type="radio"
            name="sortOrder"
            value="과거거래순"
            checked={sortOrder === '과거거래순'}
            onChange={(e) => setSortOrder(e.target.value)}
          />
          과거거래순
        </label>
      </div>

      {/* 조회 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleSearch} style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white' }}>
          조회
        </button>
      </div>

      {/* 거래내역 테이블 */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '10px' }}>거래일자</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>거래유형</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>거래금액</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>잔액</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid black', padding: '10px' }}>{transaction.date}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{transaction.type}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{transaction.amount.toLocaleString()}원</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{transaction.balance.toLocaleString()}원</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>거래내역이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 즉시이체 버튼 추가 */}
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button
          onClick={handleImmediateTransfer}
          style={{
            padding: '10px 20px',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          즉시이체
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;