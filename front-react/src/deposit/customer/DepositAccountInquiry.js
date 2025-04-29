import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositAccountInquiry.css';
import { Card, Row, Col, Typography, Divider, Tag } from 'antd';

const { Title, Text } = Typography;

const DepositAccountInquiry = () => {
    const [depositAccounts, setDepositAccounts] = useState([]);
    const [savingsAccounts, setSavingsAccounts] = useState([]);
    const customerId = getCustomerID();
    // 계좌 번호를 3자리-6자리-4자리 형식으로 포맷팅하는 함수
    const formatAccountNumber = (accountNumber) => {
    if (!accountNumber || accountNumber.length !== 13) return accountNumber; // 유효성 검사
    return `${accountNumber.slice(0, 3)}-${accountNumber.slice(3, 9)}-${accountNumber.slice(9)}`;
};

    const navigate = useNavigate();

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

        // 예금 계좌 가져오기
        RefreshToken.get(`/deposit/accounts/deposit/${customerId}`)
            .then(res => {
                console.log('예금 계좌 조회 결과:', res.data); 
                setDepositAccounts(res.data);
            })
            .catch(err => console.error('예금 계좌 조회 실패:', err));

        // 적금 계좌 가져오기
        RefreshToken.get(`/deposit/accounts/savings/${customerId}`)
            .then(res => setSavingsAccounts(res.data))
            .catch(err => console.error('적금 계좌 조회 실패:', err));
    }, [customerId]);

    const renderAccountInfo = (account) => {
        return (
            <Card key={account.id} className="accountCard" style={{ marginBottom: '15px' }}>
                <Title level={4}>{account.productName}</Title>
                <Text strong>계좌 번호: </Text><span>{formatAccountNumber(account.accountNumber)}</span>
                <br />
                <Text strong>별명: </Text><span>{account.nickname || "없음"}</span>
                <br />
                <Text strong>잔액: </Text><span>{account.balance.toLocaleString()} 원</span>
                <br />
                <Text strong>상태: </Text>
                <Tag color={account.accountStatus === 'ACTIVE' ? 'green' : 'red'}>
                    {account.accountStatus === 'ACTIVE' ? '활성' : '비활성'}
                </Tag>
            </Card>
        );
    };

    return (
        <div className="depositContainer">
            <Title level={3}>예금 계좌 목록</Title>
            {depositAccounts.length === 0 ? (
                <div>현재 조회 가능한 예금 계좌가 없습니다.</div>
            ) : (
                <Row gutter={[16, 16]}>
                    {depositAccounts
                        .filter(account => account.accountStatus === 'ACTIVE')
                        .map(account => (
                            <Col span={8} key={account.id}>
                                {renderAccountInfo(account)}
                            </Col>
                        ))}
                </Row>
            )}

            <Divider />

            <Title level={3}>적금 계좌 목록</Title>
            {savingsAccounts.length === 0 ? (
                <div>현재 조회 가능한 적금 계좌가 없습니다.</div>
            ) : (
                <Row gutter={[16, 16]}>
                    {savingsAccounts
                        .filter(account => account.accountStatus === 'ACTIVE')
                        .map(account => (
                            <Col span={8} key={account.id}>
                                {renderAccountInfo(account)}
                            </Col>
                        ))}
                </Row>
            )}
        </div>
    );
};

export default DepositAccountInquiry;
