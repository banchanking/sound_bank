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
    const customerId = getCustomerID();
    // 계좌 번호를 3자리-6자리-4자리 형식으로 포맷팅하는 함수
    const formatAccountNumber = (accountNumber) => {
        if (!accountNumber || accountNumber.length !== 13) return accountNumber; // 유효성 검사
        return `${accountNumber.slice(0, 3)}-${accountNumber.slice(3, 9)}-${accountNumber.slice(9)}`;
    };

    useEffect(() => {
        if (!customerId) {
            const goLogin = window.confirm(
                "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
            );
            if (goLogin) {
                navigate("/login");
            } else {
                navigate("/");
              }
            
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
            // 여기서 ACTIVE 계좌만 걸러주기
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
    
                    // 디버깅 로그 추가
            console.log('선택된 계좌:', account);
            console.log('요청 URL:', endpoint);
            console.log('요청 데이터:', {               
            accountPassword: password,
            accountNumber:selectedAccount,
            
         });
                await RefreshToken.post(endpoint,{
                    accountNumber:selectedAccount,
                    accountPassword: password,
                }).then((res)=>{
                    console.log(res.data)
                    alert('계좌 해지가 완료되었습니다.');
                    navigate('/');
                })
                
                
    

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
                                    {accounts
                                    .filter(account => account.accountStatus === 'ACTIVE')
                                    .map(account => (
                                        <option key={account.accountNumber} value={account.accountNumber}>
                                        {formatAccountNumber(account.accountNumber)} - {account.productName} - {account.balance.toLocaleString()}원
                                        </option>
                                    ))}
                                </select>
                                </div>


    
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
    
                                <button
                                    type="submit"
                                    className="depositBtn"
                                    disabled={loading}
                                >
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