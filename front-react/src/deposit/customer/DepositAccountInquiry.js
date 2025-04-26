import React, { useState, useEffect } from 'react';
import { Table, Tabs, Card, Button, Tag, message } from 'antd';
import RefreshToken from "../../jwt/RefreshToken";
import { getCustomerID } from "../../jwt/AxiosToken";
import { useNavigate } from 'react-router-dom';
import '../../Css/deposit/DepositAccountInquiry.css';

const { TabPane } = Tabs;

const DepositAccountInquiry = () => {
    const navigate = useNavigate();
    const [depositAccounts, setDepositAccounts] = useState([]);
    const [savingsAccounts, setSavingsAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

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
            setLoading(true);
            const customerId = getCustomerID();
            const [depositResponse, savingsResponse] = await Promise.all([
                RefreshToken.get(`/api/deposit/accounts/deposit/${customerId}`),
                RefreshToken.get(`/api/deposit/accounts/savings/${customerId}`)
            ]);
            setDepositAccounts(depositResponse.data);
            setSavingsAccounts(savingsResponse.data);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
            alert('계좌 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleAccountDetail = async (accountId, type) => {
        try {
            const endpoint = type === 'deposit' 
                ? `/api/deposit/accounts/deposit/detail/${accountId}`
                : `/api/deposit/accounts/savings/detail/${accountId}`;
            const response = await RefreshToken.get(endpoint);
            setSelectedAccount(response.data);
            setIsDetailModalVisible(true);
        } catch (error) {
            console.error('계좌 상세 조회 에러:', error);
            alert('계좌 상세 정보를 불러오는데 실패했습니다.');
        }
    };

    const depositColumns = [
        {
            title: '계좌번호',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
        },
        {
            title: '상품명',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: '잔액',
            dataIndex: 'balance',
            key: 'balance',
            render: (balance) => `${balance.toLocaleString()}원`,
        },
        {
            title: '이자율',
            dataIndex: 'interestRate',
            key: 'interestRate',
            render: (rate) => `${rate}%`,
        },
        {
            title: '계좌상태',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status === 'ACTIVE' ? '활성' : '비활성'}
                </Tag>
            ),
        },
        {
            title: '작업',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button type="link" onClick={() => handleAccountDetail(record.accountNumber, 'deposit')}>
                        상세보기
                    </Button>
                    <Button type="link" onClick={() => handleViewHistory(record)}>
                        거래내역
                    </Button>
                    <Button type="link" onClick={() => handleAutoTransfer(record)}>
                        자동이체
                    </Button>
                    <Button type="link" danger onClick={() => handleCloseAccount(record)}>
                        해지
                    </Button>
                </span>
            ),
        },
    ];

    const savingsColumns = [
        {
            title: '계좌번호',
            dataIndex: 'accountNumber',
            key: 'accountNumber',
        },
        {
            title: '상품명',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: '잔액',
            dataIndex: 'balance',
            key: 'balance',
            render: (balance) => `${balance.toLocaleString()}원`,
        },
        {
            title: '이자율',
            dataIndex: 'interestRate',
            key: 'interestRate',
            render: (rate) => `${rate}%`,
        },
        {
            title: '만기일',
            dataIndex: 'maturityDate',
            key: 'maturityDate',
        },
        {
            title: '계좌상태',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status === 'ACTIVE' ? '활성' : '비활성'}
                </Tag>
            ),
        },
        {
            title: '작업',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button type="link" onClick={() => handleAccountDetail(record.accountNumber, 'savings')}>
                        상세보기
                    </Button>
                    <Button type="link" onClick={() => handleViewHistory(record)}>
                        거래내역
                    </Button>
                    <Button type="link" onClick={() => handleAutoTransfer(record)}>
                        자동이체
                    </Button>
                    <Button type="link" danger onClick={() => handleCloseAccount(record)}>
                        해지
                    </Button>
                </span>
            ),
        },
    ];

    const handleViewDetails = (record) => {
        // 상세보기 로직 구현
        console.log('상세보기:', record);
    };

    const handleViewHistory = (record) => {
        // 거래내역 조회 로직 구현
        console.log('거래내역:', record);
    };

    const handleAutoTransfer = (record) => {
        // 자동이체 설정 로직 구현
        console.log('자동이체:', record);
    };

    const handleCloseAccount = (record) => {
        // 계좌 해지 로직 구현
        console.log('계좌해지:', record);
    };

    return (
        <div className="depositContainer">
            <h2 className="depositTitle">예적금 계좌조회</h2>
            <Card>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="예금 계좌" key="1">
                        <Table
                            columns={depositColumns}
                            dataSource={depositAccounts}
                            rowKey="accountNumber"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>
                    <TabPane tab="적금 계좌" key="2">
                        <Table
                            columns={savingsColumns}
                            dataSource={savingsAccounts}
                            rowKey="accountNumber"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default DepositAccountInquiry;