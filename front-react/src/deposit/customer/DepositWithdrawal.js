import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositWithdrawal.css';

const DepositWithdrawal = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountBalance, setAccountBalance] = useState(0);
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
    const [accountType, setAccountType] = useState('DEPOSIT');
    const customerId = getCustomerID();

    // 계좌 번호를 3자리-6자리-4자리 형식으로 포맷팅하는 함수
    const formatAccountNumber = (accountNumber) => {
        if (!accountNumber || accountNumber.length !== 13) return accountNumber; // 유효성 검사
        return `${accountNumber.slice(0, 3)}-${accountNumber.slice(3, 9)}-${accountNumber.slice(9)}`;
    };

    useEffect(() => {
        if (!customerId) {
            const goLogin = window.confirm("로그인이 필요합니다. 로그인하시겠습니까?");
            if (goLogin) {
                navigate("/login");
            } else {
                navigate("/");
            }
            return;
        }
        fetchAccounts();
    }, [navigate]);

    const fetchAccounts = async () => {
        try {
            const [depositRes, savingsRes] = await Promise.all([
                RefreshToken.get(`/deposit/accounts/customer/${customerId}`),
                RefreshToken.get(`/savings/accounts/customer/${customerId}`)
            ]);

            // 상태가 ACTIVE인 계좌만 필터링
            const allAccounts = [
                ...depositRes.data
                    .filter(acc => acc.accountStatus === 'ACTIVE') // 예금 계좌 필터링
                    .map(acc => ({ ...acc, type: 'DEPOSIT' })),
                ...savingsRes.data
                    .filter(acc => acc.accountStatus === 'ACTIVE') // 적금 계좌 필터링
                    .map(acc => ({ ...acc, type: 'SAVINGS' }))
            ];

            setAccounts(allAccounts);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
            alert('계좌 목록을 불러오는 데 실패했습니다.');
        }
    };

    const handleAccountChange = async (e) => {
        const [type, id] = e.target.value.split('-');
        const accountId = parseInt(id, 10);
        const selected = accounts.find(acc => acc.id === accountId && acc.type === type);

        if (selected) {
            setSelectedAccount(selected);
            setAccountType(type);

            try {
                const url = type === 'DEPOSIT'
                    ? `/deposit/accounts/balance/${selected.accountNumber}`
                    : `/deposit/accounts/savings/balance/${selected.accountNumber}`;

                const response = await RefreshToken.get(url);
                setAccountBalance(response.data);
            } catch (error) {
                console.error('잔액 조회 에러:', error);
                alert('잔액을 불러오는 데 실패했습니다.');
            }
        }
    };

    const handleTransaction = async (type) => {
        if (!selectedAccount) {
            alert('계좌를 선택하세요.');
            return;
        }
        if (!amount || amount <= 0) {
            alert('금액을 입력하세요.');
            return;
        }
        if (!password || password.length !== 4) {
            alert('비밀번호를 4자리 입력하세요.');
            return;
        }

        try {
            const endpoint = accountType === 'DEPOSIT'
                ? `/deposit/accounts/deposit/${selectedAccount.id}/${type}`
                : `/deposit/accounts/savings/${selectedAccount.id}/${type}`;

            await RefreshToken.post(endpoint, {
                transactionAmount: amount,
                accountPassword: password
            });

            alert(`${type === 'deposit' ? '입금' : '출금'}이 완료되었습니다.`);
            setAmount('');
            setPassword('');
            fetchAccounts();
        } catch (error) {
            console.error(`${type === 'deposit' ? '입금' : '출금'} 요청 실패:`, error);
            alert(`${type === 'deposit' ? '입금' : '출금'}에 실패했습니다.`);
        }
    };

    return (
        <div className="depositContainer">
            <div className="depositCard">
                <div className="depositProductHeader">
                    <h2>예적금 입출금</h2>
                </div>

                <form className="depositForm" onSubmit={(e) => e.preventDefault()}>
                    <div className="formGroup">
                        <label>계좌 선택</label>
                        <select onChange={handleAccountChange} required>
                            <option value="">계좌 선택</option>
                            {accounts.map(acc => (
                                <option key={`${acc.type}-${acc.id}`} value={`${acc.type}-${acc.id}`}>
                                    [{acc.type === 'DEPOSIT' ? '예금' : '적금'}] {formatAccountNumber(acc.accountNumber)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedAccount && (
                        <>
                            <div className="formGroup">
                                <label>현재 잔액</label>
                                <input type="text" value={`${accountBalance.toLocaleString()}원`} disabled />
                            </div>

                            <div className="formGroup">
                                <label>금액</label>
                                <input
                                    type="text"
                                    value={amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/,/g, "");
                                        if (!isNaN(rawValue)) {
                                            setAmount(rawValue);
                                        }
                                    }}
                                    required
                                />
                            </div>

                            <div className="formGroup">
                                <label>계좌 비밀번호 (4자리)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    maxLength={4}
                                    required
                                />
                            </div>

                            <div className="formGroup" style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    className="depositBtn"
                                    onClick={() => handleTransaction('deposit')}
                                >
                                    입금하기
                                </button>
                                <button
                                    type="button"
                                    className="depositBtn"
                                    onClick={() => handleTransaction('withdraw')}
                                >
                                    출금하기
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default DepositWithdrawal;