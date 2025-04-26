import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, InputNumber, Modal, Steps, Descriptions, DatePicker } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import RefreshToken from "../../jwt/RefreshToken";
import { getCustomerID } from "../../jwt/AxiosToken";
import { useNavigate } from 'react-router-dom';
import '../../Css/depositcss/SavingsJoin.css';

const { Option } = Select;
const { Step } = Steps;

const SavingsJoin = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);

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
        fetchProducts();
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const response = await RefreshToken.get('/deposit/products/savings');
            setProducts(response.data);
        } catch (error) {
            console.error('상품 조회 에러:', error);
            console.error('상품 정보를 불러오는데 실패했습니다.');
        }
    };

    const handleProductSelect = (productId) => {
        const product = products.find(p => p.id === productId);
        setSelectedProduct(product);
        setCurrentStep(1);
    };

    const handleJoin = async (values) => {
        try {
            await RefreshToken.post('/deposit/accounts/savings', {
                ...values,
                customerId: getCustomerID(),
                productId: selectedProduct.id,
                interestRate: selectedProduct.interestRate,
                monthlyAmount: values.monthlyAmount,
                maturityDate: values.maturityDate,
                accountPassword: values.accountPassword
            });
            console.success('적금 계좌가 개설되었습니다.');
            navigate('/deposit/accounts');
        } catch (error) {
            console.error('계좌 개설 에러:', error);
            console.error('계좌 개설에 실패했습니다.');
        }
    };

    const showConfirm = () => {
        Modal.confirm({
            title: '적금 가입 확인',
            content: (
                <Descriptions column={1}>
                    <Descriptions.Item label="상품명">{selectedProduct?.productName}</Descriptions.Item>
                    <Descriptions.Item label="이자율">{selectedProduct?.interestRate}%</Descriptions.Item>
                    <Descriptions.Item label="월 납입액">{form.getFieldValue('monthlyAmount')?.toLocaleString()}원</Descriptions.Item>
                    <Descriptions.Item label="만기일">{form.getFieldValue('maturityDate')?.format('YYYY-MM-DD')}</Descriptions.Item>
                </Descriptions>
            ),
            okText: '확인',
            cancelText: '취소',
            onOk: () => form.submit()
        });
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="depositProductSelection">
                        <h3>적금 상품 선택</h3>
                        <div className="depositProductList" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                            {products.map(product => (
                                <Card
                                    key={product.id}
                                    className="depositProductCard"
                                    onClick={() => handleProductSelect(product.id)}
                                    hoverable
                                    style={{ width: 320, border: '1px solid #e6e6e6', borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2', marginBottom: 16 }}
                                    bodyStyle={{ padding: 20 }}
                                >
                                    <h4 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{product.productName}</h4>
                                    <div style={{ marginBottom: 8, color: '#888' }}>{product.productType === 'REGULAR' ? '일반적금' : product.productType === 'FIXED' ? '정기적금' : '적금'}</div>
                                    <div style={{ fontSize: 16, marginBottom: 4 }}>이자율 <span style={{ color: '#1890ff', fontWeight: 500 }}>{product.interestRate}%</span></div>
                                    <div style={{ fontSize: 15, marginBottom: 4 }}>기간 <span style={{ color: '#52c41a', fontWeight: 500 }}>{product.termMonths}개월</span></div>
                                    <div style={{ fontSize: 15, marginBottom: 4 }}>최소월납입액 <span style={{ color: '#faad14' }}>{Number(product.minAmount).toLocaleString()}원</span></div>
                                    <div style={{ fontSize: 15, marginBottom: 4 }}>최대월납입액 <span style={{ color: '#faad14' }}>{Number(product.maxAmount).toLocaleString()}원</span></div>
                                    <div style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>{product.productDescription}</div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="depositAgreementStep" style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
                        <h3>적금 가입 약관 동의</h3>
                        <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 16, maxHeight: 200, overflowY: 'auto', fontSize: 14 }}>
                            <b>[적금상품 이용약관]</b><br />
                            1. 본 상품은 예금자보호법에 따라 보호됩니다.<br />
                            2. 이자율, 만기, 중도해지 등 상품별 세부조건을 반드시 확인하세요.<br />
                            3. 금융사고 예방을 위해 비밀번호는 타인에게 노출하지 마세요.<br />
                            4. 기타 자세한 사항은 상품설명서 및 은행 홈페이지를 참고하세요.<br />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                            <input type="checkbox" checked={isAgreed} onChange={e => setIsAgreed(e.target.checked)} style={{ marginRight: 8 }} />
                            위 약관에 동의합니다.
                        </label>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={() => setCurrentStep(0)}>이전</Button>
                            <Button type="primary" onClick={() => setCurrentStep(2)} disabled={!isAgreed}>다음</Button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleJoin}
                    >
                        <Form.Item
                            name="monthlyAmount"
                            label="월 납입액"
                            rules={[
                                { required: true, message: '월 납입액을 입력해주세요' },
                                { type: 'number', min: selectedProduct?.minAmount, message: `최소 ${selectedProduct?.minAmount?.toLocaleString()}원 이상이어야 합니다` },
                                { type: 'number', max: selectedProduct?.maxAmount, message: `최대 ${selectedProduct?.maxAmount?.toLocaleString()}원 이하여야 합니다` }
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={selectedProduct?.minAmount}
                                max={selectedProduct?.maxAmount}
                                step={10000}
                                formatter={value => `${value?.toLocaleString() || '0'}원`}
                                parser={value => value.replace(/\원\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item
                            name="maturityDate"
                            label="만기일"
                            rules={[{ required: true, message: '만기일을 선택해주세요' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                disabledDate={(current) => {
                                    const today = new Date();
                                    const maxDate = new Date();
                                    maxDate.setMonth(today.getMonth() + selectedProduct?.termMonths);
                                    return current && (current < today || current > maxDate);
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="accountPassword"
                            label="계좌비밀번호"
                            rules={[
                                { required: true, message: '계좌비밀번호를 입력해주세요' },
                                { len: 4, message: '비밀번호는 4자리여야 합니다' }
                            ]}
                        >
                            <Input.Password placeholder="계좌비밀번호 4자리" maxLength={4} />
                        </Form.Item>
                        <Form.Item
                            name="passwordConfirm"
                            label="계좌비밀번호 확인"
                            rules={[
                                { required: true, message: '비밀번호를 다시 입력해주세요' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('accountPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('비밀번호가 일치하지 않습니다'));
                                    },
                                }),
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
                                style={{ marginRight: 8 }}
                                onClick={() => setCurrentStep(1)}
                            >
                                이전
                            </Button>
                            <Button
                                type="primary"
                                htmlType="button"
                                onClick={showConfirm}
                                loading={loading}
                                style={{ width: 'calc(100% - 80px)' }}
                            >
                                가입하기
                            </Button>
                        </Form.Item>
                    </Form>
                );
            case 3:
                return (
                    <div className="depositCompletion">
                        <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
                        <h3>적금 가입이 완료되었습니다</h3>
                        <p>계좌번호: {form.getFieldValue('accountNumber')}</p>
                        <Button type="primary" onClick={() => setCurrentStep(0)}>
                            다른 상품 보기
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="depositContainer">
            <h2 className="depositTitle">적금 가입</h2>
            <Card>
                <Steps current={currentStep} style={{ marginBottom: 32 }}>
                    <Step title="상품선택" />
                    <Step title="약관동의" />
                    <Step title="정보입력" />
                    <Step title="가입완료" />
                </Steps>
                <div className="depositForm">
                    {renderStepContent()}
                </div>
            </Card>
        </div>
    );
};

export default SavingsJoin;