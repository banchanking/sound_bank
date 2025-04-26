import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message, InputNumber, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositWithdrawal.css';

const { Option } = Select;

const DepositWithdrawal = () => {
    const navigate = useNavigate();
    const { accountId } = useParams();
    const [form] = Form.useForm();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountBalance, setAccountBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const customerId = getCustomerID();
    const [accountType, setAccountType] = useState('deposit');

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
    }, [navigate, customerId]);

    const fetchAccounts = async () => {
        try {
            const response = await RefreshToken.get(`/deposit/accounts/customer/${customerId}`);
            setAccounts(response.data);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
            message.error('계좌 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleAccountChange = async (accountNumber) => {
        setSelectedAccount(accountNumber);
        try {
            const response = await RefreshToken.get(`/deposit/accounts/${accountNumber}`);
            setAccountBalance(response.data.balance);
            form.setFieldsValue({ balance: response.data.balance });
            setAccountType(response.data.productType);
        } catch (error) {
            console.error('계좌 잔액 조회 에러:', error);
            message.error('계좌 잔액을 불러오는데 실패했습니다.');
        }
    };

    const handleWithdrawal = async (values) => {
        try {
            const endpoint = accountType === 'deposit'
                ? `/deposit/accounts/deposit/${selectedAccount}/withdraw`
                : `/deposit/accounts/savings/${selectedAccount}/withdraw`;
            
            await RefreshToken.post(endpoint, {
                transactionAmount: values.amount,
                accountPassword: values.password
            });
            
            message.success('출금이 완료되었습니다.');
            form.resetFields();
            fetchAccounts();
        } catch (error) {
            console.error('출금 에러:', error);
            message.error('출금에 실패했습니다.');
        }
    };

    const handleSubmit = async (values) => {
        if (values.amount > accountBalance) {
            message.error('출금 금액이 잔액보다 큽니다.');
            return;
        }

        setLoading(true);
        try {
            await handleWithdrawal(values);
        } finally {
            setLoading(false);
        }
    };

    const showConfirm = () => {
        Modal.confirm({
            title: '출금 확인',
            content: '정말 출금하시겠습니까?',
            okText: '확인',
            cancelText: '취소',
            onOk: () => form.submit()
        });
    };

    return (
        <div className="depositContainer">
            <h2 className="depositTitle">예금 출금</h2>
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="accountNumber"
                        label="출금계좌"
                        rules={[{ required: true, message: '출금계좌를 선택해주세요' }]}
                    >
                        <Select
                            placeholder="출금계좌 선택"
                            onChange={handleAccountChange}
                        >
                            {accounts.map(account => (
                                <Option key={account.accountNumber} value={account.accountNumber}>
                                    {account.accountNumber} ({account.productName})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="balance"
                        label="계좌잔액"
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            disabled
                            formatter={value => `${value.toLocaleString()}원`}
                        />
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="출금금액"
                        rules={[
                            { required: true, message: '출금금액을 입력해주세요' },
                            { type: 'number', min: 1, message: '출금금액은 1원 이상이어야 합니다' }
                        ]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={1}
                            step={1000}
                            formatter={value => `${value.toLocaleString()}원`}
                            parser={value => value.replace(/\원\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="계좌비밀번호"
                        rules={[{ required: true, message: '계좌비밀번호를 입력해주세요' }]}
                    >
                        <Input.Password placeholder="계좌비밀번호 4자리" maxLength={4} />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="출금사유"
                    >
                        <Input.TextArea rows={2} placeholder="출금사유를 입력해주세요" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="button"
                            onClick={showConfirm}
                            loading={loading}
                            style={{ width: '100%' }}
                        >
                            출금하기
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default DepositWithdrawal;