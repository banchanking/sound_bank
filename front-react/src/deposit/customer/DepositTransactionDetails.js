import React, { useState, useEffect } from 'react';
import { Table, Card, Select, DatePicker, Button, Tag, message } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
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
    }, [navigate, accountId]);

    const fetchAccounts = async () => {
        try {
            const [depositResponse, savingsResponse] = await Promise.all([
                RefreshToken.get('/api/deposit-accounts'),
                RefreshToken.get('/api/savings-accounts')
            ]);
            const allAccounts = [
                ...depositResponse.data.map(acc => ({ ...acc, type: '예금' })),
                ...savingsResponse.data.map(acc => ({ ...acc, type: '적금' }))
            ];
            setAccounts(allAccounts);
        } catch (error) {
            message.error('계좌 정보를 불러오는데 실패했습니다.');
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await RefreshToken.get(`http://localhost:8081/api/deposit/accounts/${selectedAccount}/transactions`);
            setTransactions(response.data);
        } catch (error) {
            console.error('거래내역 조회 실패:', error);
            message.error('거래내역을 불러오는데 실패했습니다.');
        }
    };

    const handleAccountChange = async (accountId) => {
        setSelectedAccount(accountId);
        fetchTransactions();
    };

    const handleDateChange = (dates) => {
        setDateRange(dates);
    };

    const handleSearch = () => {
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
        <div className="transaction-details-container">
            <Card title="예적금 거래내역">
                <div className="search-section">
                    <Select
                        style={{ width: 300, marginRight: 16 }}
                        placeholder="계좌 선택"
                        onChange={handleAccountChange}
                        value={selectedAccount}
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