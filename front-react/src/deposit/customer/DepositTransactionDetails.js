import React, { useState, useEffect } from 'react';
import { Table, Card, Select, DatePicker, Button, Tag, message } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerID, refreshAccessToken, setAuthToken } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/deposit/DepositTransactionDetails.css';

const { RangePicker } = DatePicker;

const DepositTransactionDetails = () => {
    const navigate = useNavigate();
    const { accountId } = useParams();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [dateRange, setDateRange] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const customer_id = getCustomerID();
        if (!customer_id) {
            const goLogin = window.confirm(
                "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
            );
            if (goLogin) {
                navigate("/login");
            }
            return;
        }
        fetchAccounts();
    }, [navigate]);

    const fetchAccounts = async () => {
        try {
            const customerId = getCustomerID();
            if (!customerId) {
                const goLogin = window.confirm(
                    "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
                );
                if (goLogin) {
                    navigate("/login");
                }
                return;
            }

            const [depositResponse, savingsResponse] = await Promise.all([
                RefreshToken.get(`/api/deposit/accounts/customer/${customerId}`),
                RefreshToken.get(`/api/savings/accounts/customer/${customerId}`)
            ]);
            const allAccounts = [
                ...depositResponse.data.map(acc => ({ ...acc, type: '예금' })),
                ...savingsResponse.data.map(acc => ({ ...acc, type: '적금' }))
            ];
            setAccounts(allAccounts);
            setLoading(false);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
            if (error.response?.status === 401) {
                const goLogin = window.confirm(
                    "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
                );
                if (goLogin) {
                    navigate("/login");
                }
            } else {
                message.error('계좌 정보를 불러오는데 실패했습니다.');
            }
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        if (!selectedAccount || !dateRange || dateRange.length !== 2) {
            console.log('필수 조건 확인:', {
                selectedAccount,
                dateRange,
                dateRangeLength: dateRange?.length
            });
            message.error('계좌와 날짜 범위를 모두 선택해주세요.');
            return;
        }

        setLoading(true);
        try {
            const selectedAccountData = accounts.find(acc => acc.accountNumber === selectedAccount);
            if (!selectedAccountData) {
                message.error('선택한 계좌를 찾을 수 없습니다.');
                return;
            }

            console.log('선택된 계좌 데이터:', selectedAccountData);

            let response;
            if (selectedAccountData.type === '예금') {
                response = await RefreshToken.get(`/api/deposit/transactions/account/${selectedAccountData.datId}`, {
                    params: {
                        startDate: dateRange[0].format('YYYY-MM-DD'),
                        endDate: dateRange[1].format('YYYY-MM-DD')
                    }
                });
            } else if (selectedAccountData.type === '적금') {
                response = await RefreshToken.get(`/api/deposit/transactions/account/${selectedAccountData.satId}`, {
                    params: {
                        startDate: dateRange[0].format('YYYY-MM-DD'),
                        endDate: dateRange[1].format('YYYY-MM-DD')
                    }
                });
            }
            
            console.log('API 응답:', response.data);
            setTransactions(response.data);
        } catch (error) {
            console.error('거래내역 조회 에러:', error);
            if (error.response?.status === 401) {
                const goLogin = window.confirm(
                    "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
                );
                if (goLogin) {
                    navigate("/login");
                }
            } else if (error.response?.status === 400) {
                message.error(`잘못된 요청입니다: ${error.response.data?.message || '알 수 없는 오류'}`);
            } else if (error.response?.status === 404) {
                message.error('적금 거래내역 API가 구현되지 않았습니다.');
            } else {
                message.error('거래내역을 불러오는데 실패했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAccountChange = (value) => {
        console.log('선택된 계좌:', value);
        setSelectedAccount(value);
    };

    const handleDateChange = (dates) => {
        console.log('선택된 날짜 범위:', dates);
        setDateRange(dates);
    };

    const handleSearch = () => {
        if (!selectedAccount) {
            message.error('계좌를 선택해주세요.');
            return;
        }
        if (!dateRange || dateRange.length !== 2) {
            message.error('날짜 범위를 선택해주세요.');
            return;
        }
        fetchTransactions();
    };

    const handleExport = () => {
        // 엑셀 다운로드 로직 구현
        console.log('엑셀 다운로드');
    };

    const columns = [
        {
            title: '거래일시',
            dataIndex: 'transactionDate',
            key: 'transactionDate',
        },
        {
            title: '거래구분',
            dataIndex: 'transactionType',
            key: 'transactionType',
            render: (type) => (
                <Tag color={type === '입금' ? 'green' : 'red'}>
                    {type}
                </Tag>
            ),
        },
        {
            title: '거래금액',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `${amount.toLocaleString()}원`,
        },
        {
            title: '잔액',
            dataIndex: 'balance',
            key: 'balance',
            render: (balance) => `${balance.toLocaleString()}원`,
        },
        {
            title: '거래내용',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: '거래점',
            dataIndex: 'branch',
            key: 'branch',
        },
    ];

    return (
        <div className="depositContainer">
            <h2 className="depositTitle">예적금 거래내역</h2>
            <Card>
                <div className="depositTransactionTable">
                    <Select
                        style={{ width: 300, marginRight: 16 }}
                        placeholder="계좌 선택"
                        onChange={handleAccountChange}
                        value={selectedAccount}
                        loading={loading}
                    >
                        {accounts.map(account => (
                            <Select.Option key={account.accountNumber} value={account.accountNumber}>
                                {account.accountNumber} ({account.type} - {account.productName})
                            </Select.Option>
                        ))}
                    </Select>
                    <RangePicker
                        style={{ marginRight: 16 }}
                        onChange={handleDateChange}
                        value={dateRange}
                    />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                        style={{ marginRight: 8 }}
                    >
                        조회
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                    >
                        엑셀다운로드
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={transactions}
                    rowKey="transactionId"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>
        </div>
    );
};

export default DepositTransactionDetails;