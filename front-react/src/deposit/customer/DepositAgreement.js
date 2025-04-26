import React, { useState, useEffect } from 'react';
import { Card, Checkbox, Button, Steps, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/deposit/DepositAgreement.css';

const { Step } = Steps;

const DepositAgreement = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [agreements, setAgreements] = useState({
        termsOfService: false,
        privacyPolicy: false,
        financialTerms: false
    });
    const [agreement, setAgreement] = useState(null);

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
    }, [navigate]);

    const steps = [
        {
            title: '약관동의',
            content: (
                <div className="depositAgreementContent">
                    <h3>예금 상품 가입 약관</h3>
                    <div className="depositAgreementText">
                        <p>1. 예금 상품 가입 시 제공하신 개인정보는 예금 상품 가입 및 관리 목적으로만 사용됩니다.</p>
                        <p>2. 예금 상품의 이자율은 시장 상황에 따라 변동될 수 있습니다.</p>
                        <p>3. 예금 상품 해지 시 이자율이 적용된 잔액이 지급됩니다.</p>
                        <p>4. 예금 상품 가입 후 1개월 이내 해지 시 이자가 지급되지 않습니다.</p>
                    </div>
                    <Checkbox
                        checked={agreements.termsOfService}
                        onChange={(e) => setAgreements({ ...agreements, termsOfService: e.target.checked })}
                    >
                        예금 상품 약관에 동의합니다.
                    </Checkbox>
                </div>
            ),
        },
        {
            title: '개인정보 수집 및 이용 동의',
            content: (
                <div className="depositAgreementContent">
                    <h3>개인정보 수집 및 이용 동의</h3>
                    <div className="depositAgreementText">
                        <p>1. 수집항목: 성명, 주민등록번호, 연락처, 주소</p>
                        <p>2. 이용목적: 예금 상품 가입 및 관리, 이자 지급</p>
                        <p>3. 보유기간: 예금 상품 해지 후 5년</p>
                        <p>4. 동의를 거부할 권리가 있으며, 동의 거부 시 예금 상품 가입이 제한됩니다.</p>
                    </div>
                    <Checkbox
                        checked={agreements.privacyPolicy}
                        onChange={(e) => setAgreements({ ...agreements, privacyPolicy: e.target.checked })}
                    >
                        개인정보 수집 및 이용에 동의합니다.
                    </Checkbox>
                </div>
            ),
        },
        {
            title: '예금 상품 특약 동의',
            content: (
                <div className="depositAgreementContent">
                    <h3>예금 상품 특약</h3>
                    <div className="depositAgreementText">
                        <p>1. 예금 상품의 이자율은 가입 시점의 기준금리에 따라 결정됩니다.</p>
                        <p>2. 예금 상품 해지 시 이자율이 적용된 잔액이 지급됩니다.</p>
                        <p>3. 예금 상품 가입 후 1개월 이내 해지 시 이자가 지급되지 않습니다.</p>
                        <p>4. 예금 상품의 이자율은 시장 상황에 따라 변동될 수 있습니다.</p>
                    </div>
                    <Checkbox
                        checked={agreements.financialTerms}
                        onChange={(e) => setAgreements({ ...agreements, financialTerms: e.target.checked })}
                    >
                        예금 상품 특약에 동의합니다.
                    </Checkbox>
                </div>
            ),
        },
    ];

    const next = () => {
        if (current === 0 && !agreements.termsOfService) {
            message.error('예금 상품 약관에 동의해주세요.');
            return;
        }
        if (current === 1 && !agreements.privacyPolicy) {
            message.error('개인정보 수집 및 이용에 동의해주세요.');
            return;
        }
        if (current === 2 && !agreements.financialTerms) {
            message.error('예금 상품 특약에 동의해주세요.');
            return;
        }
        setCurrent(current + 1);
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const fetchAgreement = async () => {
        try {
            const response = await RefreshToken.get('http://localhost:8081/api/deposit/agreement');
            setAgreement(response.data);
        } catch (error) {
            console.error('약관 조회 실패:', error);
            message.error('약관을 불러오는데 실패했습니다.');
        }
    };

    const handleAgree = async () => {
        try {
            await RefreshToken.post('http://localhost:8081/api/deposit/agreement/agree');
            message.success('약관에 동의했습니다.');
            navigate('/deposit/join');
        } catch (error) {
            console.error('약관 동의 실패:', error);
            message.error('약관 동의에 실패했습니다.');
        }
    };

    return (
        <div className="depositContainer">
            <Card>
                <Steps current={current}>
                    {steps.map(item => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>
                <div className="depositStepsContent">{steps[current].content}</div>
                <div className="depositStepsAction">
                    {current > 0 && (
                        <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                            이전
                        </Button>
                    )}
                    {current < steps.length - 1 && (
                        <Button type="primary" onClick={() => next()}>
                            다음
                        </Button>
                    )}
                    {current === steps.length - 1 && (
                        <Button type="primary" onClick={handleAgree}>
                            동의하고 계속하기
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DepositAgreement; 