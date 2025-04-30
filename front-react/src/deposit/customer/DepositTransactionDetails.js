import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositTransactionDetails.css';

const DepositTransactionDetails = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatAccountNumber = (accountNumber) => {
        if (!accountNumber || accountNumber.length !== 13) return accountNumber;
        return `${accountNumber.slice(0, 3)}-${accountNumber.slice(3, 9)}-${accountNumber.slice(9)}`;
    };

    const formatDate = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 6) return '';
        const [year, month, day, hour, minute, second] = dateArray;
        return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    };

    useEffect(() => {
        const customerId = getCustomerID();
        if (!customerId) {
            const goLogin = window.confirm("로그인이 필요합니다. 로그인하시겠습니까?");
            if (goLogin) navigate("/login");
            else navigate("/");
            return;
        }
        fetchAccounts();
    }, [navigate]);

    const fetchAccounts = async () => {
        try {
            const customerId = getCustomerID();
            const [depositRes, savingsRes] = await Promise.all([
                RefreshToken.get(`/deposit/accounts/customer/${customerId}`),
                RefreshToken.get(`/savings/accounts/customer/${customerId}`)
            ]);
            const allAccounts = [
                ...depositRes.data.map(acc => ({ ...acc, type: 'DEPOSIT' })),
                ...savingsRes.data.map(acc => ({ ...acc, type: 'SAVINGS' }))
            ];
            setAccounts(allAccounts);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
            alert('계좌 목록을 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        if (!selectedAccount || !dateRange.start || !dateRange.end) return;
        try {
            setLoading(true);
            const endpoint = selectedAccount.type === 'DEPOSIT'
                ? `/deposit/accounts/deposit/${selectedAccount.id}/transactions`
                : `/deposit/accounts/savings/${selectedAccount.id}/transactions`;

            const response = await RefreshToken.get(endpoint, {
                params: {
                    startDate: dateRange.start,
                    endDate: dateRange.end
                }
            });

            if (Array.isArray(response.data)) {
                const enriched = response.data.map(tx => ({
                    ...tx,
                    savedType: selectedAccount.type
                }));
                setTransactions(enriched);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error('거래내역 조회 에러:', error);
            alert('거래내역을 불러오는 데 실패했습니다.');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAccountChange = (e) => {
        const [type, id] = e.target.value.split('-');
        const accountId = parseInt(id, 10);
        const account = accounts.find(a => a.id === accountId && a.type.toUpperCase() === type.toUpperCase());
        setSelectedAccount(account);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = () => {
        if (!selectedAccount || !dateRange.start || !dateRange.end) {
            alert('계좌와 날짜를 모두 선택해주세요.');
            return;
        }
        fetchTransactions();
    };

    const setDateRangeByPreset = (preset) => {
        const now = new Date();
        let startDate = new Date(now);

        switch (preset) {
            case 'day':
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case '6month':
                startDate.setMonth(startDate.getMonth() - 6);
                break;
            default:
                return;
        }

        const format = (date) => date.toISOString().split('T')[0];
        setDateRange({ start: format(startDate), end: format(now) });
    };

    return (
        <div className="depositContainer">
            <div className="depositCard">
                {accounts.length === 0 ? (
                    <div>현재 조회 가능한 계좌가 없습니다.</div>
                ) : (
                    <>
                        <div className="depositProductHeader">
                            <h2>예적금 거래내역 조회</h2>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label>계좌 선택</label>
                            <select onChange={handleAccountChange} value={selectedAccount ? `${selectedAccount.type}-${selectedAccount.id}` : ''} required>
                                <option value="">계좌를 선택하세요</option>
                                {accounts
                                    .filter(acc => acc.accountStatus === 'ACTIVE')
                                    .map(acc => (
                                        <option key={`${acc.type}-${acc.id}`} value={`${acc.type}-${acc.id}`}>
                                            [{acc.type === 'DEPOSIT' ? '예금' : '적금'}] {formatAccountNumber(acc.accountNumber)} - {acc.productName} - {Number(acc?.balance ?? 0).toLocaleString()}원
                                            </option>

                                    ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <button onClick={() => setDateRangeByPreset('day')}>당일</button> &nbsp;
                            <button onClick={() => setDateRangeByPreset('week')}>1주일</button> &nbsp;
                            <button onClick={() => setDateRangeByPreset('month')}>1개월</button> &nbsp;
                            <button onClick={() => setDateRangeByPreset('6month')}>6개월</button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label>조회 시작일</label>
                            <input type="date" name="start" value={dateRange.start} onChange={handleDateChange} />
                            <label>조회 종료일</label>
                            <input type="date" name="end" value={dateRange.end} onChange={handleDateChange} />
                        </div>

                        <button className="depositBtn" onClick={handleSearch}>
                            조회
                        </button>

                        <div className="depositTableContainer">
                            <table className="depositTable">
                                <thead>
                                    <tr>
                                        <th>거래일시</th>
                                        <th>거래구분</th>
                                        <th>거래금액</th>
                                        <th>잔액</th>
                                        <th>거래내용</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length > 0 ? (
                                        transactions.map((tx, idx) => (
                                        <tr key={tx?.id ?? idx}>
                                            <td>{formatDate(tx?.transactionDate)}</td>
                                            <td>{selectedAccount?.type === 'SAVINGS' ? '적금' : '예금'}</td>
                                            <td>{Number(tx?.transactionAmount ?? 0).toLocaleString()}원</td>
                                            <td>{Number(tx?.balance ?? 0).toLocaleString()}원</td> 
                                            <td>{tx?.transactionDescription || '없음'}</td>
                                        </tr>
                                        ))
                                    ) : (
                                        <tr>
                                        <td colSpan="5">거래내역이 없습니다.</td>
                                        </tr>
                                    )}
                                    </tbody>

                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DepositTransactionDetails;
