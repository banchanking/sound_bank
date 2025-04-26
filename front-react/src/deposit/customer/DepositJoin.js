import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, message, InputNumber, Modal, Steps, Descriptions } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import RefreshToken from "../../jwt/RefreshToken";
import { getCustomerID } from "../../jwt/AxiosToken";
import { useNavigate } from 'react-router-dom';
import '../../Css/deposit/DepositJoin.css';

const { Option } = Select;
const { Step } = Steps;

const DepositJoin = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [products, setProducts] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);

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
            const response = await RefreshToken.get(`/api/deposit/accounts/deposit/${getCustomerID()}`);
            setProducts(response.data);
        } catch (error) {
            console.error('상품 조회 실패:', error);
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
            await RefreshToken.post('/api/deposit/accounts/deposit', {
                ...values,
                customerId: getCustomerID()
            });
            message.success('예금 계좌가 개설되었습니다.');
            navigate('/deposit/accounts');
        } catch (error) {
            console.error('계좌 개설 에러:', error);
            message.error('계좌 개설에 실패했습니다.');
        }
    };

    const showConfirm = () => {
        Modal.confirm({
            title: '예금 가입 확인',
            content: (
                <Descriptions column={1}>
                    <Descriptions.Item label="상품명">{selectedProduct?.name || '선택된 상품 없음'}</Descriptions.Item>
                    <Descriptions.Item label="이자율">{selectedProduct?.interestRate || 0}%</Descriptions.Item>
                    <Descriptions.Item label="가입금액">{form.getFieldValue('amount')?.toLocaleString() || '0'}원</Descriptions.Item>
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
                        <h3>예금 상품 선택</h3>
                        <div className="depositProductList">
                            {products && products.length > 0 ? (
                                products.map(product => (
                                    <Card
                                        key={product.id}
                                        className="depositProductCard"
                                        onClick={() => handleProductSelect(product.id)}
                                    >
                                        <h4>{product.name}</h4>
                                        <p>이자율: {product.interestRate}%</p>
                                        <p>최소금액: {product.minAmount?.toLocaleString() || '0'}원</p>
                                        <p>최대금액: {product.maxAmount?.toLocaleString() || '0'}원</p>
                                    </Card>
                                ))
                            ) : (
                                <p>등록된 예금 상품이 없습니다.</p>
                            )}

                        </div>
                    </div>
                );
            case 1:
                return (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleJoin}
                    >
                        <Form.Item
                            name="amount"
                            label="가입금액"
                            rules={[
                                { required: true, message: '가입금액을 입력해주세요' },
                                { type: 'number', min: selectedProduct?.minAmount || 0, message: `최소 ${(selectedProduct?.minAmount || 0).toLocaleString()}원 이상이어야 합니다` },
                                { type: 'number', max: selectedProduct?.maxAmount || 0, message: `최대 ${(selectedProduct?.maxAmount || 0).toLocaleString()}원 이하여야 합니다` }

                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={selectedProduct?.minAmount || 0}
                                max={selectedProduct?.maxAmount || 0}
                                step={10000}
                                formatter={value => `${value?.toLocaleString() || '0'}원`}
                                parser={value => value.replace(/\원\s?|(,*)/g, '')}
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
                            name="passwordConfirm"
                            label="계좌비밀번호 확인"
                            rules={[
                                { required: true, message: '비밀번호를 다시 입력해주세요' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
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
                                type="primary"
                                htmlType="button"
                                onClick={showConfirm}
                                loading={loading}
                                style={{ width: '100%' }}
                            >
                                가입하기
                            </Button>
                        </Form.Item>
                    </Form>
                );
            case 2:
                return (
                    <div className="depositCompletion">
                        <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a' }} />
                        <h3>예금 가입이 완료되었습니다</h3>
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
            <h2 className="depositTitle">예금 가입</h2>
            <Card>
                <Steps current={currentStep}>
                    <Step title="상품선택" />
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

export default DepositJoin;