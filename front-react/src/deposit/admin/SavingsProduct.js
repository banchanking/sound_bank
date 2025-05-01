import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import RefreshToken from '../../jwt/RefreshToken';
import '../../Css/depositcss/DepositProduct.css';

const { Option } = Select;

const SavingsProduct = () => {
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
            const response = await RefreshToken.get('/deposit/products/savings');
            setProducts(response.data);
        } catch (error) {
            console.error('적금 상품 조회 에러:', error);
            window.alert('적금 상품 정보를 불러오는데 실패했습니다.');
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

    const handleSubmit = async (values) => {
        try {
            // 👇 상품유형을 소문자로 변환
            values.productType = values.productType.toLowerCase();
    
            console.log("제출할 데이터:", values);
    
            if (editingId) {
                await RefreshToken.put(`/deposit/products/savings/${editingId}`, values);
                window.alert('적금 상품이 수정되었습니다.');
            } else {
                await RefreshToken.post('/deposit/products/savings', values);
                window.alert('적금 상품이 추가되었습니다.');
            }
            fetchProducts();
            handleCancel();
        } catch (error) {
            console.error('적금 상품 저장 에러:', error);
            window.alert('적금 상품 저장에 실패했습니다.');
        }
    };
    

    const handleDelete = async (id) => {
        try {
            await RefreshToken.delete(`/deposit/products/savings/${id}`);
            window.alert('적금 상품이 삭제되었습니다.');
            fetchProducts();
        } catch (error) {
            console.error('적금 상품 삭제 에러:', error);
            window.alert('적금 상품 삭제에 실패했습니다.');
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
                    installment: '적금',
                    housing: '주택청약적금',
                    pension: '연금적금',
                    youth: '청년적금',
                    fixed: '정기적금'
                };
                return typeMap[type?.toLowerCase()] || type;
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
                    <Button type="primary" icon={<EditOutlined />} onClick={() => showModal(record)}>수정</Button>
                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>삭제</Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="depositContainer">
            <Card>
                <div className="depositProductHeader">
                    <h2>적금 상품 관리</h2>
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
                    onOk={() => form.submit()}  
                    onCancel={handleCancel}
                    width={600}
                >
                    <Form form={form} layout="vertical"onFinish={handleSubmit}>
                        <Form.Item name="productName" label="상품명" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item name="productType" label="상품유형" rules={[{ required: true }]}>
                            <Select placeholder="상품 유형 선택">
                                <Option value="installment">적금</Option>
                                <Option value="housing">주택청약적금</Option>
                                <Option value="pension">연금적금</Option>
                                <Option value="youth">청년적금</Option>
                                <Option value="fixed">정기적금</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="interestRate" label="이자율" rules={[{ required: true }]}>
                            <InputNumber min={0} max={100} step={0.01} formatter={v => `${v}%`} parser={v => v.replace('%', '')} />
                        </Form.Item>

                        <Form.Item name="minAmount" label="최소금액" rules={[{ required: true }]}>
                            <InputNumber min={0} step={10000} formatter={v => `${v.toLocaleString()}원`} parser={v => v.replace(/\원\s?|(,*)/g, '')} />
                        </Form.Item>

                        <Form.Item name="maxAmount" label="최대금액" rules={[{ required: true }]}>
                            <InputNumber min={0} step={10000} formatter={v => `${v.toLocaleString()}원`} parser={v => v.replace(/\원\s?|(,*)/g, '')} />
                        </Form.Item>

                        <Form.Item name="termMonths" label="기간(개월)" rules={[{ required: true }]}>
                            <InputNumber min={1} max={60} />
                        </Form.Item>

                        <Form.Item name="productDescription" label="상품설명">
                            <Input.TextArea />
                        </Form.Item>
                    </Form>
                </Modal>
            </Card>
        </div>
    );
};

export default SavingsProduct;
