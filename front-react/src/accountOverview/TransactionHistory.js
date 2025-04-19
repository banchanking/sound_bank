import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCustomerID } from '../jwt/AxiosToken';
import RefreshToken from '../jwt/RefreshToken';
import '../Css/AccountOverview/TransactionHistory.css';

/**
 * 거래내역 조회를 위한 컴포넌트
 * - 계좌 선택
 * - 조회기간 설정
 * - 거래유형 필터링
 * - 거래내역 조회 및 표시
 */
const TransactionHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // 이전 페이지에서 전달받은 계좌 정보
  const { accountNumber } = location.state || {};
  const [selectedAccount, setSelectedAccount] = useState(accountNumber || '');
  const [accounts, setAccounts] = useState([]);

  // 조회 조건 상태
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [transactionType, setTransactionType] = useState('전체내역');
  const [sortOrder, setSortOrder] = useState('최근거래순');
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');

  /**
   * 컴포넌트 마운트 시 로그인한 사용자의 예금 계좌 목록을 가져옴
   * - 로그인한 사용자의 ID로 예금 계좌 조회
   * - 계좌번호가 전달되지 않았으면 첫 번째 계좌를 선택
   */
  useEffect(() => {
    const fetchAccounts = async () => {
      const id = getCustomerID();
      if (!id) {
        alert('로그인이 필요합니다');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8081/api/depositList?customerId=${id}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          // 예금 계좌만 필터링하고 필요한 정보만 추출
          const depositAccounts = data.map(item => ({
            account_number: item.dat_deposit_account_num,
            account_name: `예금계좌 (${item.dat_deposit_account_num})`,
            balance: item.dat_balance
          }));
          setAccounts(depositAccounts);
          
          // 계좌번호가 전달되지 않았고 계좌 목록이 있다면 첫 번째 계좌를 선택
          if (!accountNumber && depositAccounts.length > 0) {
            setSelectedAccount(depositAccounts[0].account_number);
          }
        } else {
          console.error('API 응답이 배열이 아닙니다:', data);
          setAccounts([]);
        }
      } catch (error) {
        console.error('계좌 목록 조회 실패:', error);
        alert('계좌 목록을 불러오는데 실패했습니다.');
      }
    };

    fetchAccounts();
  }, [accountNumber]);

  /**
   * 빠른 날짜 범위 선택 처리
   * - 오늘, 1주일, 15일, 1개월, 3개월 옵션 제공
   * @param {string} range 선택된 날짜 범위
   */
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

  /**
   * 거래내역 조회 처리
   * - 계좌 선택 여부 확인
   * - 날짜 유효성 검사
   * - API 호출 및 결과 처리
   */
  const handleSearch = async () => {
    if (!selectedAccount) {
      alert('계좌를 선택해주세요.');
      return;
    }

    // 날짜 유효성 검사
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      alert('시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/transactionHistory/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dat_deposit_account_num: selectedAccount,
          startDate: startDate,
          endDate: endDate,
          year: year,
          month: month,
          transactionType: transactionType,
          sortOrder: sortOrder
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '거래내역 조회에 실패했습니다.');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setTransactions(data.data || []);
      setMessage(data.data && data.data.length === 0 ? '조회된 거래내역이 없습니다.' : '');
    } catch (error) {
      console.error('거래내역 조회 중 오류 발생:', error);
      setMessage(error.message);
      setTransactions([]);
    }
  };

  // 즉시이체 버튼 클릭 시 DepositWithdrawal 화면으로 이동
  const handleImmediateTransfer = () => {
    navigate('/depositWithdrawal', { state: { accountNumbers: [selectedAccount], selectedAccount } });
  };

  return (
    <div className="transaction-history-container">
      <h1 className="transaction-history-title">거래내역 조회</h1>

      {/* 계좌 선택 */}
      <div className="transaction-history-info">
        <h2>계좌 선택</h2>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="form-select"
        >
          <option value="">계좌 선택</option>
          {accounts.map((account) => (
            <option key={account.account_number} value={account.account_number}>
              {account.account_name} - 잔액: {account.balance.toLocaleString()}원
            </option>
          ))}
        </select>
      </div>

      {/* 조회기간 설정 */}
      <div className="transaction-history-info">
        <h2>조회기간</h2>
        <div className="form-group">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
          />
          ~
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="button-group">
          <button onClick={() => handleQuickDateRange('오늘')} className="action-button">오늘</button>
          <button onClick={() => handleQuickDateRange('1주일')} className="action-button">1주일</button>
          <button onClick={() => handleQuickDateRange('15일')} className="action-button">15일</button>
          <button onClick={() => handleQuickDateRange('1개월')} className="action-button">1개월</button>
          <button onClick={() => handleQuickDateRange('3개월')} className="action-button">3개월</button>
        </div>
      </div>

      {/* 월별 조회 설정 */}
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

      {/* 거래유형 필터링 */}
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

      {/* 정렬순서 설정 */}
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
        <button 
          onClick={handleSearch} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: 'blue', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          조회
        </button>
      </div>

      {/* 거래내역 테이블 */}
      <table className="transaction-history-table">
        <thead>
          <tr>
            <th>거래일자</th>
            <th>거래유형</th>
            <th>거래금액</th>
            <th>거래설명</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.transactionDate}</td>
                <td className={transaction.transactionType === '입금' ? 'deposit' : 'withdrawal'}>
                  {transaction.transactionType}
                </td>
                <td>{transaction.amount.toLocaleString()}원</td>
                <td>{transaction.description}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '10px' }}>{message}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 즉시이체 버튼 */}
      <div className="button-group">
        <button onClick={handleImmediateTransfer} className="action-button submit-button">
          즉시이체
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;