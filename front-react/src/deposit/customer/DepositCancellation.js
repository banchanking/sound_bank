import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositCancellation.css';

const DepositCancellation = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [calculatedInfo, setCalculatedInfo] = useState(null);
    const customerId = getCustomerID();

    const formatAccountNumber = (accountNumber) => {
        if (!accountNumber || accountNumber.length !== 13) return accountNumber;
        return `${accountNumber.slice(0, 3)}-${accountNumber.slice(3, 9)}-${accountNumber.slice(9)}`;
    };

    useEffect(() => {
        if (!customerId) {
            const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
            if (goLogin) navigate("/login");
            else navigate("/");
            return;
        }
        fetchAccounts();
    }, [navigate, customerId]);

    const fetchAccounts = async () => {
        try {
            const [depositResponse, savingsResponse] = await Promise.all([
                RefreshToken.get(`/deposit/accounts/customer/${customerId}`),
                RefreshToken.get(`/savings/accounts/customer/${customerId}`)
            ]);
            const allAccounts = [
                ...depositResponse.data.map(acc => ({ ...acc, type: '예금' })),
                ...savingsResponse.data.map(acc => ({ ...acc, type: '적금' }))
            ];
            const activeAccounts = allAccounts.filter(acc => acc.accountStatus === 'ACTIVE');
            setAccounts(activeAccounts);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
            alert('계좌 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccountChange = (e) => {
        const accountNumber = e.target.value;
        setSelectedAccount(accountNumber);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    useEffect(() => {
        if (!selectedAccount) return;
    
        // 선택된 계좌 객체를 찾는다
        const acc = accounts.find(a => a.accountNumber === selectedAccount);
    
        // 계좌 정보가 없거나 이자율, 기간 정보가 없으면 종료
        if (!acc || !acc.interestRate || !acc.termMonths) return;
    
        // 연이율(%)을 소수점으로 변환
        const rate = acc.interestRate / 100;
    
        // 예치 기간 (개월 수)
        const months = acc.termMonths;
    
        // 원금 (현재 잔액)
        const principal = acc.balance;
    
        // 이자에 적용할 세율 (15.4%)
        const taxRate = 0.154;
    
        // 세전 이자 = 원금 * 연이율 * (개월 / 12)
        const interest = principal * rate * (months / 12);
    
        // 세후 이자 = 세전 이자 * (1 - 세율)
        const afterTax = interest * (1 - taxRate);
    
        // 최종 수령액 = 원금 + 세후 이자
        const total = principal + afterTax;
    
        // 계산된 결과 상태로 저장
        setCalculatedInfo({
            principal,
            interest: Math.floor(interest),     
            afterTax: Math.floor(afterTax),     
            total: Math.floor(total)            
        });
    }, [selectedAccount, accounts]);
    

    const handleCancellation = async (e) => {
        e.preventDefault();
        if (!selectedAccount) {
            alert('계좌를 선택해주세요.');
            return;
        }
        if (!password) {
            alert('계좌 비밀번호를 입력해주세요.');
            return;
        }

        try {
            const account = accounts.find(acc => acc.accountNumber === selectedAccount);
            const endpoint = account.type === '예금'
                ? `/deposit/accounts/deposit/close`
                : `/deposit/accounts/savings/close`;

                console.log('해지 요청 데이터:', {
                    accountNumber: selectedAccount,
                    accountPassword: password,
                  });
                  
            await RefreshToken.post(endpoint, {
                accountNumber: selectedAccount,
                accountPassword: password,
            });
            alert('계좌 해지가 완료되었습니다.');
            navigate('/');
        } catch (error) {
            console.error('계좌 해지 에러:', error);
            alert('계좌 해지에 실패했습니다.');
        }
    };

    return (
        <div className="depositContainer">
            <div className="depositCard">
                <div className="depositProductHeader">
                    <h2>예적금 계좌 해지</h2>
                </div>

                {accounts.length === 0 ? (
                    <div>현재 조회 가능한 계좌가 없습니다.</div>
                ) : (
                    <form onSubmit={handleCancellation} className="depositForm">
                        <div className="formGroup">
                            <label htmlFor="accountNumber">해지할 계좌</label>
                            <select
                                id="accountNumber"
                                value={selectedAccount || ''}
                                onChange={handleAccountChange}
                                required
                            >
                                <option value="">계좌 선택</option>
                                {accounts.map(account => (
                                    <option key={account.accountNumber} value={account.accountNumber}>
                                        {formatAccountNumber(account.accountNumber)} - {account.productName} - {(account.balance != null ? account.balance.toString() : '0')}원
                                    </option>
                                ))}
                            </select>
                        </div>

                        {calculatedInfo && (
                            <div className="formHint" style={{ marginTop: '10px' }}>
                                <p>원금: {calculatedInfo.principal.toLocaleString()}원</p>
                                <p>이자(세전): {calculatedInfo.interest.toLocaleString()}원</p>
                                <p>세후 이자: {calculatedInfo.afterTax.toLocaleString()}원</p>
                                <strong>총 수령액: {calculatedInfo.total.toLocaleString()}원</strong>
                            </div>
                        )}

                        {selectedAccount && (
                            <>
                                <div className="formGroup">
                                    <label htmlFor="password">계좌 비밀번호</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        maxLength={4}
                                        required
                                    />
                                </div>

                                <button type="submit" className="depositBtn" disabled={loading}>
                                    계좌 해지하기
                                </button>
                            </>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default DepositCancellation;