import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Css/Deposit/DepositWithdrawal.css';

const DepositWithdrawal = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { initialAccount } = location.state || {};
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(initialAccount || '');
    const [amount, setAmount] = useState('');
    const [transactionType, setTransactionType] = useState('deposit');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const customerId = localStorage.getItem('customerId');
                const response = await fetch(`http://localhost:8081/api/depositList?customerId=${customerId}`);
                const data = await response.json();
                
                if (response.ok) {
                    const depositAccounts = data.map(account => ({
                        accountNumber: account.accountNumber,
                        accountName: account.accountName,
                        balance: account.balance
                    }));
                    setAccounts(depositAccounts);
                    if (!initialAccount && depositAccounts.length > 0) {
                        setSelectedAccount(depositAccounts[0].accountNumber);
                    }
                } else {
                    throw new Error(data.message || '계좌 목록을 불러오는데 실패했습니다.');
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchAccounts();
    }, [initialAccount]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:8081/api/deposit/transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accountNumber: selectedAccount,
                    amount: transactionType === 'deposit' ? amount : -amount,
                    transactionType: transactionType
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '거래 처리에 실패했습니다.');
            }

            setSuccess('거래가 성공적으로 처리되었습니다.');
            setAmount('');
            setTimeout(() => {
                navigate('/accountOverview');
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="deposit-withdrawal-container">
            <h1 className="deposit-withdrawal-title">예금 입출금</h1>
            <div className="withdrawal-form">
                <div className="form-section">
                    <h2 className="section-title">계좌 선택</h2>
                    <div className="form-group">
                        <label className="form-label">계좌 선택</label>
                        <select
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="form-select"
                        >
                            {accounts.map(account => (
                                <option key={account.accountNumber} value={account.accountNumber}>
                                    {account.accountName} ({account.accountNumber}) - 잔액: {account.balance.toLocaleString()}원
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h2 className="section-title">거래 정보</h2>
                        <div className="form-group">
                            <label className="form-label">거래 유형</label>
                            <div className="button-group">
                                <button
                                    type="button"
                                    className={`action-button ${transactionType === 'deposit' ? 'deposit-button active' : 'deposit-button'}`}
                                    onClick={() => setTransactionType('deposit')}
                                >
                                    입금
                                </button>
                                <button
                                    type="button"
                                    className={`action-button ${transactionType === 'withdrawal' ? 'withdrawal-button active' : 'withdrawal-button'}`}
                                    onClick={() => setTransactionType('withdrawal')}
                                >
                                    출금
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">금액</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="form-input"
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="action-button submit-button">
                            {transactionType === 'deposit' ? '입금하기' : '출금하기'}
                        </button>
                        <button 
                            type="button" 
                            className="action-button cancel-button"
                            onClick={() => navigate('/accountOverview')}
                        >
                            취소
                        </button>
                    </div>
                </form>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}
            </div>
        </div>
    );
};

export default DepositWithdrawal; 