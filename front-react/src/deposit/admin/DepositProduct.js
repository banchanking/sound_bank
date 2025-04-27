import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import '../../Css/depositcss/DepositProduct.css';
import RefreshToken from '../../jwt/RefreshToken';

const { Option } = Select;

const DepositProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await RefreshToken.get('/deposit/products/deposit');
            setProducts(response.data);
        } catch (error) {
            console.error('상품 조회 에러:', error);
            window.alert('상품 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const showModal = (record = null) => {
        if (record) {
            form.setFieldsValue(record);
            setEditingId(record.id);
        } else {
            form.resetFields();
            setEditingId(null);
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingId(null);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingId) {
                await RefreshToken.put(`/deposit/products/deposit/${editingId}`, values);
                window.alert('예금 상품이 수정되었습니다.');
            } else {
                await RefreshToken.post('/deposit/products/deposit', values);
                window.alert('예금 상품이 추가되었습니다.');
            }
            fetchProducts();
            handleCancel();
        } catch (error) {
            console.error('예금 상품 저장 에러:', error);
            window.alert('예금 상품 저장에 실패했습니다.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await RefreshToken.delete(`/deposit/products/deposit/${id}`);
            window.alert('예금 상품이 삭제되었습니다.');
            fetchProducts();
        } catch (error) {
            console.error('예금 상품 삭제 에러:', error);
            window.alert('예금 상품 삭제에 실패했습니다.');
        }
    };

    const columns = [
        {
            title: '상품명',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: '상품유형',
            dataIndex: 'productType',
            key: 'productType',
            render: (type) => {
                const typeMap = {
                    REGULAR: '일반예금',
                    FIXED: '정기예금',
                    INSTALLMENT: '적금'
                };
                return typeMap[type] || type;
            }
        },
        {
            title: '이자율',
            dataIndex: 'interestRate',
            key: 'interestRate',
            render: (rate) => `${rate}%`
        },
        {
            title: '최소금액',
            dataIndex: 'minAmount',
            key: 'minAmount',
            render: (amount) => `${amount.toLocaleString()}원`
        },
        {
            title: '최대금액',
            dataIndex: 'maxAmount',
            key: 'maxAmount',
            render: (amount) => `${amount.toLocaleString()}원`
        },
        {
            title: '기간',
            dataIndex: 'termMonths',
            key: 'termMonths',
            render: (term) => `${term}개월`
        },
        {
            title: '관리',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                    >
                        수정
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                    >
                        삭제
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="depositContainer">
            <Card>
                <div className="depositProductHeader">
                    <h2>예금 상품 관리</h2>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                        className="depositBtn"
                    >
                        상품 추가
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={products}
                    loading={loading}
                    rowKey="id"
                    className="depositTable"
                />

                <Modal
                    title={editingId ? '상품 수정' : '상품 추가'}
                    visible={isModalVisible}
                    onOk={handleSubmit}
                    onCancel={handleCancel}
                    width={600}
                >
                    <Form
                        form={form}
                        layout="vertical"
                    >
                        <Form.Item
                            name="productName"
                            label="상품명"
                            rules={[{ required: true, message: '상품명을 입력해주세요' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="productType"
                            label="상품유형"
                            rules={[{ required: true, message: '상품유형을 선택해주세요' }]}
                        >
                            <Select>
                                <Option value="REGULAR">일반예금</Option>
                                <Option value="FIXED">정기예금</Option>
                                <Option value="INSTALLMENT">적금</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="interestRate"
                            label="이자율"
                            rules={[{ required: true, message: '이자율을 입력해주세요' }]}
                        >
                            <InputNumber
                                min={0}
                                max={100}
                                step={0.01}
                                formatter={value => `${value}%`}
                                parser={value => value.replace('%', '')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="minAmount"
                            label="최소금액"
                            rules={[{ required: true, message: '최소금액을 입력해주세요' }]}
                        >
                            <InputNumber
                                min={0}
                                step={10000}
                                formatter={value => `${value.toLocaleString()}원`}
                                parser={value => value.replace(/\원\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="maxAmount"
                            label="최대금액"
                            rules={[{ required: true, message: '최대금액을 입력해주세요' }]}
                        >
                            <InputNumber
                                min={0}
                                step={10000}
                                formatter={value => `${value.toLocaleString()}원`}
                                parser={value => value.replace(/\원\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="termMonths"
                            label="기간(개월)"
                            rules={[{ required: true, message: '기간을 입력해주세요' }]}
                        >
                            <InputNumber
                                min={1}
                                max={60}
                            />
                        </Form.Item>

                        <Form.Item
                            name="productDescription"
                            label="상품설명"
                        >
                            <Input.TextArea />
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default DepositProduct;