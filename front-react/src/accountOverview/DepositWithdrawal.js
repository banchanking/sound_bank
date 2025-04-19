import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCustomerID } from '../jwt/AxiosToken';
import RefreshToken from '../jwt/RefreshToken';
import '../Css/AccountOverview/DepositWithdrawal.css';

/**
 * 예금계좌 입출금 처리를 위한 컴포넌트
 * - 계좌 선택
 * - 입금/출금 선택
 * - 금액 입력
 * - 거래 실행 및 거래내역 저장
 */
const DepositWithdrawal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // 이전 페이지에서 전달받은 계좌 정보
  const { accountNumbers = [], selectedAccount: initialAccount } = location.state || {};
  const [selectedAccount, setSelectedAccount] = useState(initialAccount || '');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('입금');
  const [message, setMessage] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [currentTime, setCurrentTime] = useState('');

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
          if (!selectedAccount && depositAccounts.length > 0) {
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
  }, [selectedAccount]);

  useEffect(() => {
    const id = localStorage.getItem('customerId');
    if (!id) {
      navigate('/login');
      return;
    }

    // 현재 시간 업데이트
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(formattedTime);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  /**
   * 입출금 거래를 처리하는 함수
   * 1. 금액 유효성 검사
   * 2. 입출금 거래 실행
   * 3. 거래내역 저장
   * 4. 거래 성공 시 거래내역 페이지로 이동
   */
  const handleTransaction = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setMessage('유효한 금액을 입력해주세요.');
      return;
    }

    try {
      // 1. 입출금 거래 실행
      const transactionResponse = await fetch(`http://localhost:8081/api/depositWithdrawal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dat_deposit_account_num: selectedAccount,
          dat_new_amount: parseFloat(amount),
          dat_transaction_type: transactionType,
        }),
      });

      if (!transactionResponse.ok) {
        throw new Error('거래 실패');
      }

      // 2. 거래내역 저장
      console.log('거래내역 저장 요청 데이터:', {
        dat_deposit_account_num: selectedAccount,
        amount: parseFloat(amount),
        transactionType: transactionType,
        description: `${transactionType} 거래`
      });

      const historyResponse = await fetch(`http://localhost:8081/api/transactionHistory/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          dat_deposit_account_num: selectedAccount.toUpperCase(),
          amount: parseFloat(amount),
          transactionType: transactionType,
          description: `${transactionType} 거래`
        }),
      });

      let responseText = '';
      try {
        responseText = await historyResponse.text();
        console.log('서버 응답:', responseText);

        if (!historyResponse.ok) {
          console.error('거래내역 저장 실패:', responseText);
          setMessage(responseText);
          throw new Error(responseText);
        }

        try {
          const historyResult = JSON.parse(responseText);
          console.log('거래내역 저장 결과:', historyResult);
          setMessage(historyResult.message || '거래내역이 저장되었습니다.');
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          setMessage(responseText || '거래내역이 저장되었습니다.');
        }
      } catch (error) {
        console.error('거래내역 처리 중 오류:', error);
        setMessage(responseText || '거래내역 처리 중 오류가 발생했습니다.');
        throw error;
      }

      // 3. 거래 성공 시 거래내역 페이지로 이동
      setTimeout(() => {
        navigate('/transactionHistory', { 
          state: { 
            accountNumber: selectedAccount,
            message: '거래가 완료되었습니다.'
          } 
        });
      }, 1500);

    } catch (error) {
      console.error('거래 처리 중 오류 발생:', error);
      setMessage('거래 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="deposit-withdrawal-container">
      <h1 className="deposit-withdrawal-title">예금/적금 출금</h1>

      <div className="deposit-withdrawal-info">
        <h2>현재 시간: {currentTime}</h2>
      </div>

      <div className="deposit-withdrawal-form">
        <div className="form-section">
          <label>출금계좌</label>
          <select 
            className="form-select"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="">계좌를 선택하세요</option>
            {accounts.map((account) => (
              <option key={account.account_number} value={account.account_number}>
                {account.account_name} - 잔액: {account.balance.toLocaleString()}원
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label>출금금액</label>
          <input
            type="number"
            className="form-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="출금할 금액을 입력하세요"
          />
        </div>

        <div className="button-group">
          <button 
            onClick={handleTransaction}
            className="action-button submit-button"
            disabled={!selectedAccount || !amount}
          >
            출금
          </button>
        </div>

        {message && <div className="error-message">{message}</div>}
      </div>
    </div>
  );
};

export default DepositWithdrawal;