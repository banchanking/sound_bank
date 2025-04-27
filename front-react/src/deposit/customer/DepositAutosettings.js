// DepositAutosettings.js - 자동이체 등록 화면 (수정본)
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, InputNumber, Modal, Descriptions } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositAutosettings.css';

const DepositAutosettings = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const customerId = getCustomerID();

    useEffect(() => {
        if (!customerId) {
            const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
            if (goLogin) navigate("/login");
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
        }
    };

    const handleAccountChange = (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        setSelectedAccount(account);
        form.setFieldsValue({ datId: account.id });
    };

    const handleSubmit = async (values) => {
        try {
            await RefreshToken.post(`/deposit/auto-transfer`, {
                datId: selectedAccount.id,
                targetAccountNumber: values.targetAccountNumber,
                transferAmount: values.transferAmount,
                transferDay: values.transferDay,
                transferStatus: 'ACTIVE'
            });
            alert('자동이체가 등록되었습니다.');
            navigate('/deposit/automanagement');
        } catch (error) {
            console.error('자동이체 등록 에러:', error);
            alert('자동이체 등록에 실패했습니다.');
        }
    };

    return (
        <div className="depositContainer">
            <Card title="자동이체 설정">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="accountId" label="계좌 선택" rules={[{ required: true, message: '계좌를 선택해주세요' }]}> 
                        <select onChange={(e) => handleAccountChange(Number(e.target.value))}>
                            <option value="">계좌 선택</option>
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.accountNumber} - {account.productName}
                                </option>
                            ))}
                        </select>
                    </Form.Item>

                    {selectedAccount && (
                        <>
                            <Form.Item name="targetAccountNumber" label="이체할 계좌번호" rules={[{ required: true }]}> 
                                <Input placeholder="이체할 계좌번호 입력" />
                            </Form.Item>

                            <Form.Item name="transferAmount" label="이체 금액" rules={[{ required: true }]}> 
                                <InputNumber min={10000} step={10000} style={{ width: '100%' }} placeholder="10000원 단위" />
                            </Form.Item>

                            <Form.Item name="transferDay" label="매월 이체일 (1~28일)" rules={[{ required: true }]}> 
                                <InputNumber min={1} max={28} style={{ width: '100%' }} placeholder="1~28일 입력" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>자동이체 등록</Button>
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Card>
        </div>
    );
};

export default DepositAutosettings;
