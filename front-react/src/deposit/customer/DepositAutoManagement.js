import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, message, Tag, Form } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import axios from 'axios';
import '../../Css/depositcss/DepositAutoManagement.css';

const DepositAutoManagement = () => {
    const navigate = useNavigate();
    const { accountId } = useParams();
    const [autoTransfers, setAutoTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [form] = Form.useForm();

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
        fetchAutoTransfers();
    }, [navigate]);

    const fetchAutoTransfers = async () => {
        try {
            const customerId = getCustomerID();
            const response = await RefreshToken.get(`/deposit/auto-transfers/customer/${customerId}`);
            setAutoTransfers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('자동이체 조회 에러:', error);
            console.error('자동이체 정보를 불러오는데 실패했습니다.');
            setLoading(false);
        }
    };

    const handleEdit = async (record) => {
        Modal.confirm({
            title: '자동이체 수정',
            content: '자동이체 수정 페이지로 이동하시겠습니까?',
            okText: '이동',
            cancelText: '취소',
            onOk: () => {
                // 자동이체 수정 페이지로 이동
                window.location.href = `/deposit/autosettings/${record.id}`;
            }
        });
    };

    const handleDelete = async (record) => {
        Modal.confirm({
            title: '자동이체 해지',
            content: '정말로 이 자동이체를 해지하시겠습니까?',
            okText: '해지',
            cancelText: '취소',
            onOk: async () => {
                try {
                    await axios.delete(`/auto-transfers/${record.id}`);
                    message.success('자동이체가 해지되었습니다.');
                    fetchAutoTransfers();
                } catch (error) {
                    console.error('자동이체 해지 중 오류가 발생했습니다.');
                }
            }
        });
    };

    const handleUpdateAutoTransfer = async (values) => {
        if (!selectedAccount) {
            message.error('계좌를 선택해주세요.');
            return;
        }

        try {
            await RefreshToken.put(`/deposit/accounts/deposit/${selectedAccount}/auto-transfer`, {
                autoTransferEnabled: values.enabled,
                autoTransferAmount: values.amount,
                autoTransferDay: values.day
            });
            message.success('자동이체 설정이 수정되었습니다.');
            form.resetFields();
            fetchAutoTransfers();
        } catch (error) {
            console.error('자동이체 수정 에러:', error);
            message.error('자동이체 수정에 실패했습니다.');
        }
    };

    const columns = [
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
            title: '이체금액',
            dataIndex: 'transferAmount',
            key: 'transferAmount',
            render: (amount) => `${amount.toLocaleString()}원`,
        },
        {
            title: '이체일자',
            dataIndex: 'transferDate',
            key: 'transferDate',
            render: (date) => `매월 ${date}일`,
        },
        {
            title: '이체계좌',
            dataIndex: 'transferAccount',
            key: 'transferAccount',
            render: (account) => `${account.accountNumber} (${account.bankName})`,
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
                    {status === 'ACTIVE' ? '정상' : '중지'}
                </Tag>
            ),
        },
        {
            title: '관리',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button
                        type="link"
                        onClick={() => handleEdit(record)}
                    >
                        수정
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record)}
                    >
                        해지
                    </Button>
                </span>
            ),
        },
    ];

    return (
        <div className="depositContainer">
            <Card title="자동이체 관리">
                <Table
                    columns={columns}
                    dataSource={autoTransfers}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `총 ${total}건`,
                    }}
                />
            </Card>
        </div>
    );
};

export default DepositAutoManagement;