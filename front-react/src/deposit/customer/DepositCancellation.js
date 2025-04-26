import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message, Modal, Descriptions, InputNumber } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/deposit/DepositCancellation.css';

const { Option } = Select;

const DepositCancellation = () => {
    const navigate = useNavigate();
    const { accountId } = useParams();
    const [form] = Form.useForm();
    const [accounts, setAccounts] = useState([]);
    const [transferAccounts, setTransferAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
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
        fetchTransferAccounts();
        fetchAccountDetails();
    }, [navigate, accountId]);

    const fetchAccounts = async () => {
        try {
            const customerId = getCustomerID();
            const response = await RefreshToken.get(`/api/deposit/accounts/customer/${customerId}`);
            setAccounts(response.data);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
            console.error('계좌 정보를 불러오는데 실패했습니다.');
        }
    };

    const fetchTransferAccounts = async () => {
        try {
            const response = await RefreshToken.get('/api/transfer-accounts');
            setTransferAccounts(response.data);
        } catch (error) {
            console.error('이체계좌 정보를 불러오는데 실패했습니다.');
        }
    };

    const fetchAccountDetails = async () => {
        try {
            const customerId = getCustomerID();
            const response = await RefreshToken.get(`/api/deposit/accounts/${accountId}`, {
                params: { customerId }
            });
            setSelectedAccount(response.data);
            setLoading(false);
        } catch (error) {
            console.error('계좌 정보 조회 에러:', error);
            message.error('계좌 정보를 불러오는데 실패했습니다.');
            setLoading(false);
        }
    };

    const handleAccountChange = async (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        setSelectedAccount(account);
        form.setFieldsValue({
            accountId: account.id,
            balance: account.balance,
            password: '',
            transferAccount: null
        });
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const customerId = getCustomerID();
            await RefreshToken.post(`/api/deposit/accounts/${values.accountId}/cancel`, {
                ...values,
                customerId
            });
            message.success('예금 계좌 해지가 완료되었습니다.');
            form.resetFields();
            navigate('/deposit/accounts');
        } catch (error) {
            console.error('계좌 해지 에러:', error);
            message.error('계좌 해지에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const showConfirmModal = (values) => {
        Modal.confirm({
            title: '예금 해지 확인',
            content: '정말로 이 예금 계좌를 해지하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            okText: '해지',
            okType: 'danger',
            cancelText: '취소',
            onOk: () => handleSubmit(values)
        });
    };

    const handleCancellation = async (values) => {
        try {
            await RefreshToken.delete(`/api/deposit/accounts/deposit/${selectedAccount}`, {
                data: {
                    accountPassword: values.password
                }
            });
            message.success('예금 계좌가 해지되었습니다.');
            navigate('/deposit/accounts');
        } catch (error) {
            console.error('계좌 해지 에러:', error);
            message.error('계좌 해지에 실패했습니다.');
        }
    };

    return (
        <div className="deposit-cancellation-container">
            <Card title="예금 계좌 해지">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={showConfirmModal}
                >
                    <Form.Item
                        name="accountId"
                        label="해지할 계좌"
                        rules={[{ required: true, message: '계좌를 선택해주세요' }]}
                    >
                        <Select
                            placeholder="계좌를 선택해주세요"
                            onChange={handleAccountChange}
                        >
                            {accounts.map(account => (
                                <Option key={account.id} value={account.id}>
                                    {account.accountNumber} - {account.productName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {selectedAccount && (
                        <>
                            <Form.Item
                                name="balance"
                                label="잔액"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    value={selectedAccount.balance}
                                    disabled
                                    formatter={value => `${value.toLocaleString()}원`}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="계좌비밀번호"
                                rules={[
                                    { required: true, message: '계좌비밀번호를 입력해주세요' },
                                    { len: 4, message: '비밀번호는 4자리여야 합니다' }
                                ]}
                            >
                                <Input.Password placeholder="계좌비밀번호 4자리" maxLength={4} />
                            </Form.Item>

                            <Form.Item
                                name="transferAccount"
                                label="이체계좌"
                                rules={[{ required: true, message: '이체계좌를 선택해주세요' }]}
                            >
                                <Select placeholder="이체계좌 선택">
                                    {transferAccounts.map(account => (
                                        <Option key={account.id} value={account.id}>
                                            {account.accountNumber} - {account.bankName}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    danger
                                    htmlType="button"
                                    loading={loading}
                                    style={{ width: '100%' }}
                                >
                                    해지하기
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Card>
        </div>
    );
};

export default DepositCancellation;