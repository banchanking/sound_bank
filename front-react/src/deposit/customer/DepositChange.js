import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositChange.css';

const { Option } = Select;

const DepositChange = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const customerId = getCustomerID();

    useEffect(() => {
        if (!customerId) {
            const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
            if (goLogin) {
                navigate("/login");
              } else {
                navigate("/");
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

    const handleAccountChange = (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        setSelectedAccount(account);
        form.setFieldsValue({
            password: '',
            oldPassword: '',
            nickname: account.nickname || '',
        });
    };

    const handlePasswordChange = async (values) => {
        if (!selectedAccount) {
            message.error('계좌를 먼저 선택해주세요.');
            return;
        }
    // 보내는 데이터 확인용 로그
    console.log('변경할 비밀번호:', values);

    try {
        await RefreshToken.put(`/deposit/accounts/deposit/${selectedAccount.id}/password`, {
            accountId: selectedAccount.id, // 이거 같이 보내야 한다!
            oldPassword: values.oldPassword,
            newPassword: values.newPassword
        });
        
    } catch (error) {
        console.error('비밀번호 변경 에러:', error);
        message.error('비밀번호 변경에 실패했습니다.');
    }
        message.success('비밀번호가 변경되었습니다.');
    };

    const handleNicknameChange = async (values) => {
        if (!selectedAccount) {
            message.error('계좌를 먼저 선택해주세요.');
            return;
        }
        try {
            await RefreshToken.put(`/deposit/accounts/deposit/${selectedAccount.id}/nickname`, {
                nickname: values.nickname
            });
            message.success('별명이 변경되었습니다.');
        } catch (error) {
            console.error('별명 변경 에러:', error);
            message.error('별명 변경에 실패했습니다.');
        }
    };

    return (
        <div className="depositContainer">
            <h2 className="depositTitle">예금 계좌 정보 변경</h2>
            <Card>
                {accounts.length === 0 ? (
                    <div>현재 조회 가능한 계좌가 없습니다.</div>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
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
                                {accounts
                                .filter(account => account.accountStatus === 'ACTIVE')
                                .map(account => (
                                    <Option key={account.id} value={account.id}>
                                    {account.accountNumber} - {account.productName} - {account.balance.toLocaleString()}원
                                    </Option>
                                ))}
                            </Select>
                            </Form.Item>

    
                        {selectedAccount && (
                            <>
                                {/* 기존 비밀번호와 새 비밀번호 변경 */}
                                <Form.Item
                                    name="oldPassword"
                                    label="기존 비밀번호 (4자리)"
                                    rules={[
                                        { required: true, message: '기존 비밀번호를 입력해주세요' },
                                        { len: 4, message: '비밀번호는 4자리여야 합니다' }
                                    ]}
                                >
                                    <Input.Password maxLength={4} placeholder="기존 비밀번호 입력" />
                                </Form.Item>
    
                                <Form.Item
                                    name="newPassword"
                                    label="새 비밀번호 (4자리)"
                                    rules={[
                                        { required: true, message: '새 비밀번호를 입력해주세요' },
                                        { len: 4, message: '비밀번호는 4자리여야 합니다' }
                                    ]}
                                >
                                    <Input.Password maxLength={4} placeholder="새 비밀번호 입력" />
                                </Form.Item>
    
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        onClick={() => form.validateFields(['oldPassword', 'newPassword']).then(handlePasswordChange)}
                                        style={{ width: '100%', marginBottom: '10px' }}
                                    >
                                        비밀번호 변경
                                    </Button>
                                </Form.Item>
    
                                {/* 계좌 별명 변경 */}
                                <Form.Item
                                    name="nickname"
                                    label="계좌 별명 (선택)"
                                    rules={[{ max: 20, message: '별명은 최대 20자까지 가능합니다' }]}
                                >
                                    <Input placeholder="예: 월급통장, 비상금통장" />
                                </Form.Item>
    
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        onClick={() => form.validateFields(['nickname']).then(handleNicknameChange)}
                                        style={{ width: '100%' }}
                                    >
                                        별명 변경
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form>
                )}
            </Card>
        </div>
    );
    
};

export default DepositChange;
