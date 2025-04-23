import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const DepositWithdrawal = () => {
  const location = useLocation();
  const { accountNumbers = [] } = location.state || {}; // 계좌번호 목록을 전달받음
  const [selectedAccount, setSelectedAccount] = useState(accountNumbers[0] || ''); // 기본 선택 계좌번호
  const [amount, setAmount] = useState(''); // 입출금 금액
  const [transactionType, setTransactionType] = useState('입금'); // 기본 거래유형: 입금
  const [message, setMessage] = useState(''); // 결과 메시지

  const handleTransaction = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setMessage('유효한 금액을 입력해주세요.');
      return;
    }
  
    try {
      const requestBody = {
        dat_deposit_account_num: selectedAccount, // 예금계좌번호
        dat_new_amount: parseFloat(amount), // 신규 금액
        dat_transaction_type: transactionType, // 거래 유형 (입금/출금)
      };
  
      console.log('Request Body:', requestBody);
  
      const response = await fetch(`http://localhost:8081/api/depositWithdrawal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        const data = await response.text();
        setMessage(data);
      } else {
        const error = await response.text();
        setMessage(`거래 실패: ${error}`);
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      setMessage('거래 실패: 네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>예적금 입출금</h1>

      {/* 조회계좌번호 */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>계좌번호:</label>
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
          {accountNumbers.map((account, index) => (
            <option key={index} value={account}>
              {account}
            </option>
          ))}
        </select>
      </div>

      {/* 거래유형 */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>거래유형:</label>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            name="transactionType"
            value="입금"
            checked={transactionType === '입금'}
            onChange={(e) => setTransactionType(e.target.value)}
          />
          입금
        </label>
        <label>
          <input
            type="radio"
            name="transactionType"
            value="출금"
            checked={transactionType === '출금'}
            onChange={(e) => setTransactionType(e.target.value)}
          />
          출금
        </label>
      </div>

      {/* 금액 입력 */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <label style={{ marginRight: '10px' }}>금액:</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="금액을 입력하세요"
          style={{
            border: '1px solid #ccc',
            padding: '5px',
            borderRadius: '4px',
            width: '300px',
          }}
        />
      </div>

      {/* 거래 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleTransaction}
          style={{
            padding: '10px 20px',
            backgroundColor: transactionType === '입금' ? 'blue' : 'red',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {transactionType}하기
        </button>
      </div>

      {/* 결과 메시지 */}
      {message && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default DepositWithdrawal;