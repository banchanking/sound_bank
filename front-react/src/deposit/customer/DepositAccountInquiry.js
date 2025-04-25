import React, { useState, useEffect } from 'react';
import { Table, Tabs, Card, Button, Tag, message } from 'antd';
import { EyeOutlined, HistoryOutlined, SettingOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
            const [depositResponse, savingsResponse] = await Promise.all([
                RefreshToken.get(`/api/deposit/accounts/customer/${customerId}`),
                RefreshToken.get(`/api/savings/accounts/customer/${customerId}`)
            ]);
            setDepositAccounts(depositResponse.data);
            setSavingsAccounts(savingsResponse.data);
            setLoading(false);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
            message.error('계좌 정보를 불러오는데 실패했습니다.');
            setLoading(false);
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
                    <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
                        상세보기
                    </Button>
                    <Button type="link" icon={<HistoryOutlined />} onClick={() => handleViewHistory(record)}>
                        거래내역
                    </Button>
                    <Button type="link" icon={<SettingOutlined />} onClick={() => handleAutoTransfer(record)}>
                        자동이체
                    </Button>
                    <Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => handleCloseAccount(record)}>
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
                    <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
                        상세보기
                    </Button>
                    <Button type="link" icon={<HistoryOutlined />} onClick={() => handleViewHistory(record)}>
                        거래내역
                    </Button>
                    <Button type="link" icon={<SettingOutlined />} onClick={() => handleAutoTransfer(record)}>
                        자동이체
                    </Button>
                    <Button type="link" danger icon={<CloseCircleOutlined />} onClick={() => handleCloseAccount(record)}>
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
        <div className="account-inquiry-container">
            <Card title="예적금 계좌조회">
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