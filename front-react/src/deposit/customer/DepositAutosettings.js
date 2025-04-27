import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message, InputNumber, Modal, Descriptions, DatePicker } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositAutosettings.css';

const { Option } = Select;

const DepositAutosettings = () => {
    const navigate = useNavigate();
    const { accountId } = useParams();
    const [form] = Form.useForm();
    const [accounts, setAccounts] = useState([]);
    const [transferAccounts, setTransferAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [autoSettings, setAutoSettings] = useState([]);
    const customerId = getCustomerID();

    useEffect(() => {
        if (!customerId) {
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
        fetchAutoSettings();
    }, [navigate, customerId]);

    const fetchAccounts = async () => {
        try {
            const response = await RefreshToken.get(`/deposit/accounts/customer/${customerId}`);
            setAccounts(response.data);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
            console.error('계좌 정보를 불러오는데 실패했습니다.');
        }
    };

    const fetchTransferAccounts = async () => {
        try {
            const response = await RefreshToken.get('/deposit/transfer-accounts', {
                params: { customerId }
            });
            setTransferAccounts(response.data);
        } catch (error) {
            console.error('이체 계좌 조회 에러:', error);
            console.error('이체계좌 정보를 불러오는데 실패했습니다.');
        }
    };

    const fetchAutoSettings = async () => {
        try {
            const response = await RefreshToken.get(`/deposit/accounts/${selectedAccount}/auto-transfer`);
            setAutoSettings(response.data);
        } catch (error) {
            console.error('자동이체 설정 조회 에러:', error);
            console.error('자동이체 설정을 불러오는데 실패했습니다.');
        }
    };

    const handleAccountChange = async (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        setSelectedAccount(account);
        form.setFieldsValue({
            accountId: account.id,
            transferAmount: account.autoTransferAmount || 0,
            transferDate: account.autoTransferDate ? new Date(account.autoTransferDate) : null,
            transferAccount: account.transferAccount
        });
    };

    const handleAutoTransfer = async (values) => {
        try {
            await RefreshToken.put(`/deposit/accounts/deposit/${selectedAccount}/auto-transfer`, {
                autoTransferEnabled: true,
                autoTransferAmount: values.amount,
                autoTransferDay: values.day
            });
            message.success('자동이체가 설정되었습니다.');
            form.resetFields();
            fetchAccounts();
        } catch (error) {
            console.error('자동이체 설정 에러:', error);
            message.error('자동이체 설정에 실패했습니다.');
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await RefreshToken.post('/deposit/auto-transfers', {
                ...values,
                customerId
            });
            console.success('자동이체 설정이 완료되었습니다.');
            form.resetFields();
        } catch (error) {
            console.error('자동이체 설정 에러:', error);
            console.error('자동이체 설정에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const showConfirm = () => {
        Modal.confirm({
            title: '자동이체 설정 확인',
            content: (
                <Descriptions column={1}>
                    <Descriptions.Item label="계좌번호">{selectedAccount?.accountNumber}</Descriptions.Item>
                    <Descriptions.Item label="이체금액">{form.getFieldValue('transferAmount')?.toLocaleString()}원</Descriptions.Item>
                    <Descriptions.Item label="이체일자">매월 {form.getFieldValue('transferDate')?.format('DD')}일</Descriptions.Item>
                    <Descriptions.Item label="이체계좌">{form.getFieldValue('transferAccount')}</Descriptions.Item>
                </Descriptions>
            ),
            okText: '확인',
            cancelText: '취소',
            onOk: () => form.submit()
        });
    };

    return (
        <div className="depositContainer">
            <Card title="자동이체 설정">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="accountId"
                        label="계좌 선택"
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
                                name="transferAmount"
                                label="이체금액"
                                rules={[
                                    { required: true, message: '이체금액을 입력해주세요' },
                                    { type: 'number', min: 10000, message: '최소 10,000원 이상이어야 합니다' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={10000}
                                    step={10000}
                                    formatter={value => `${value.toLocaleString()}원`}
                                    parser={value => value.replace(/\원\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item
                                name="transferDate"
                                label="이체일자"
                                rules={[{ required: true, message: '이체일자를 선택해주세요' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    picker="date"
                                    format="DD"
                                    disabledDate={(current) => {
                                        return current && (current.date() < 1 || current.date() > 28);
                                    }}
                                />
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
                                    htmlType="button"
                                    onClick={showConfirm}
                                    loading={loading}
                                    style={{ width: '100%' }}
                                >
                                    설정하기
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Card>
        </div>
    );
};

export default DepositAutosettings;