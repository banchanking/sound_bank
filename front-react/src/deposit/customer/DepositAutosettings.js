import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, InputNumber } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositAutosettings.css';

const DepositAutosettings = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [accounts, setAccounts] = useState([]); // 전체 계좌 목록
    const [selectedWithdrawAccount, setSelectedWithdrawAccount] = useState(null); // 출금 계좌
    const customerId = getCustomerID();

    useEffect(() => {
        if (!customerId) {
            const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
            if (goLogin) navigate("/login");
            return;
        }
        fetchAccounts();
    }, [navigate, customerId]);

    // 계좌 목록 가져오기
    const fetchAccounts = async () => {
        try {
            const response = await RefreshToken.get(`/deposit/accounts/customer/${customerId}`);
            setAccounts(response.data);
        } catch (error) {
            console.error('계좌 조회 에러:', error);
        }
    };

    // 출금 계좌 변경 시 처리
    const handleWithdrawAccountChange = (accountId) => {
        const account = accounts.find(a => a.id === accountId);
        setSelectedWithdrawAccount(account);
        form.setFieldsValue({ targetAccountNumber: account.accountNumber }); // 이체할 계좌번호에 출금 계좌번호 설정
    };

    // 자동이체 등록 처리
    const handleSubmit = async (values) => {
        try {
            await RefreshToken.post(`/deposit/auto-transfer`, {
                datId: selectedWithdrawAccount.id,
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
            {accounts.length === 0 ? (
                <Card>
                    <div>현재 조회 가능한 계좌가 없습니다.</div>
                </Card>
            ) : (
                <Card title="자동이체 설정">
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        {/* 출금 계좌 선택 */}
                        <Form.Item
                            name="withdrawAccountId"
                            label="출금 계좌"
                            rules={[{ required: true, message: '출금 계좌를 선택해주세요' }]}
                        >
                            <select
                                onChange={(e) => handleWithdrawAccountChange(Number(e.target.value))}
                                value={selectedWithdrawAccount?.id || ''}
                            >
                                <option value="">출금 계좌 선택</option>
                                {accounts
                                    .filter(account => account.accountStatus === 'ACTIVE')
                                    .map(account => (
                                        <option key={account.id} value={account.id}>
                                            {account.accountNumber} - {account.productName} - {account.balance.toLocaleString()}원
                                        </option>
                                    ))}
                            </select>
                        </Form.Item>

                        {/* 이체할 계좌번호 */}
                        {selectedWithdrawAccount && (
                            <>
                                <Form.Item
                                    name="targetAccountNumber"
                                    label="이체할 계좌번호"
                                    rules={[{ required: true, message: '이체할 계좌번호를 입력해주세요' }]}
                                >
                                    <Input
                                        placeholder="이체할 계좌번호 입력"
                                        value={selectedWithdrawAccount.accountNumber} // 출금 계좌번호를 기본값으로 설정
                                        disabled // 사용자가 수정하지 못하도록 비활성화
                                    />
                                </Form.Item>

                                {/* 이체 금액 */}
                                <Form.Item
                                    name="transferAmount"
                                    label="이체 금액"
                                    rules={[{ required: true, message: '이체 금액을 입력해주세요' }]}
                                >
                                    <InputNumber
                                        min={10000}
                                        step={10000}
                                        style={{ width: '100%' }}
                                        placeholder="10000원 단위"
                                    />
                                </Form.Item>

                                {/* 이체일 */}
                                <Form.Item
                                    name="transferDay"
                                    label="매월 이체일 (1~28일)"
                                    rules={[{ required: true, message: '이체일을 입력해주세요' }]}
                                >
                                    <InputNumber
                                        min={1}
                                        max={28}
                                        style={{ width: '100%' }}
                                        placeholder="1~28일 입력"
                                    />
                                </Form.Item>

                                {/* 등록 버튼 */}
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                        자동이체 등록
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form>
                </Card>
            )}
        </div>
    );
};

export default DepositAutosettings;