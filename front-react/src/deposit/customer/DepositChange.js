import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message, InputNumber, Modal, Descriptions } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositChange.css';

const { Option } = Select;

const DepositChange = () => {
    const navigate = useNavigate();
    const { accountId } = useParams();
    const [form] = Form.useForm();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(true);
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

    const handleAccountChange = async (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        setSelectedAccount(account.id);
        form.setFieldsValue({
            accountId: account.id,
            password: '',
            autoTransfer: account.autoTransfer,
            transferAccount: account.transferAccount
        });
    };

    const handleChange = async (values) => {
        try {
            await RefreshToken.put(`/deposit/accounts/deposit/${selectedAccount}/password`, {
                accountPassword: values.newPassword
            });
            message.success('비밀번호가 변경되었습니다.');
            form.resetFields();
        } catch (error) {
            console.error('비밀번호 변경 에러:', error);
            message.error('비밀번호 변경에 실패했습니다.');
        }
    };

    const showConfirm = () => {
        Modal.confirm({
            title: '예금 계좌 정보 변경 확인',
            content: (
                <Descriptions column={1}>
                    <Descriptions.Item label="계좌번호">{selectedAccount?.accountNumber}</Descriptions.Item>
                    <Descriptions.Item label="자동이체 설정">{form.getFieldValue('autoTransfer') ? '설정' : '설정안함'}</Descriptions.Item>
                    {form.getFieldValue('autoTransfer') && (
                        <Descriptions.Item label="이체계좌">{form.getFieldValue('transferAccount')}</Descriptions.Item>
                    )}
                </Descriptions>
            ),
            okText: '확인',
            cancelText: '취소',
            onOk: () => form.submit()
        });
    };

    return (
        <div className="depositContainer">
            <h2 className="depositTitle">예금 계좌 정보 변경</h2>
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleChange}
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
                                name="autoTransfer"
                                valuePropName="checked"
                                label="자동이체 설정"
                            >
                                <Select>
                                    <Option value={false}>설정안함</Option>
                                    <Option value={true}>설정</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                noStyle
                                shouldUpdate={(prevValues, currentValues) => prevValues.autoTransfer !== currentValues.autoTransfer}
                            >
                                {({ getFieldValue }) =>
                                    getFieldValue('autoTransfer') ? (
                                        <Form.Item
                                            name="transferAccount"
                                            label="이체계좌"
                                            rules={[{ required: true, message: '이체계좌를 선택해주세요' }]}
                                        >
                                            <Select placeholder="이체계좌 선택">
                                                {/* 이체계좌 목록은 API로 받아와야 함 */}
                                            </Select>
                                        </Form.Item>
                                    ) : null
                                }
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="button"
                                    onClick={showConfirm}
                                    loading={loading}
                                    style={{ width: '100%' }}
                                >
                                    변경하기
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Card>
        </div>
    );
};

export default DepositChange;