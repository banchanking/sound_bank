import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import axios from 'axios';
import { Table, Card, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message } from 'antd';
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/SavingsProduct.css';

const { Option } = Select;

const SavingsProduct = () => {
    const [savingsProducts, setSavingsProducts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSavingsProducts();
    }, []);

    const fetchSavingsProducts = async () => {
        try {
            setLoading(true);
            const response = await RefreshToken.get('/deposit/products/savings');
            setSavingsProducts(response.data);
        } catch (error) {
            console.error('상품 조회 에러:', error);
            alert('상품 정보를 불러오는데 실패했습니다.');
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
                await RefreshToken.put(`/deposit/products/savings/${editingId}`, values);
                message.success('적금 상품이 수정되었습니다.');
            } else {
                await RefreshToken.post('/deposit/products/savings', values);
                message.success('적금 상품이 추가되었습니다.');
            }
            fetchSavingsProducts();
            handleCancel();
        } catch (error) {
            console.error('적금 상품 저장 에러:', error);
            message.error('적금 상품 저장에 실패했습니다.');
        }
    };

    const handleDelete = async (id) => {
        try {
            await RefreshToken.delete(`/deposit/products/savings/${id}`);
            message.success('적금 상품이 삭제되었습니다.');
            fetchSavingsProducts();
        } catch (error) {
            console.error('적금 상품 삭제 에러:', error);
            message.error('적금 상품 삭제에 실패했습니다.');
        }
    };

    const columns = [
        {
            title: '적금 ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: '상품명',
            dataIndex: 'productName',
            key: 'productName',
        },
        {
            title: '금리',
            dataIndex: 'interestRate',
            key: 'interestRate',
            render: (rate) => `${rate}%`,
        },
        {
            title: '기간',
            dataIndex: 'termMonths',
            key: 'termMonths',
            render: (term) => `${term}개월`,
        },
        {
            title: '최소 금액',
            dataIndex: 'minAmount',
            key: 'minAmount',
            render: (amount) => `${amount.toLocaleString()}원`,
        },
        {
            title: '최대 금액',
            dataIndex: 'maxAmount',
            key: 'maxAmount',
            render: (amount) => `${amount.toLocaleString()}원`,
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: '작업',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button type="link" onClick={() => showModal(record)}>
                        수정
                    </Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>
                        삭제
                    </Button>
                </span>
            ),
        },
    ];

    return (
        <div className="depositContainer">
            <div className="depositProductHeader">
                <h2>적금 상품 관리</h2>
                <Button type="primary" onClick={() => showModal()}>
                    새 상품 추가
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={savingsProducts}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingId ? '적금 상품 수정' : '새 적금 상품 추가'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="productName"
                        label="상품명"
                        rules={[{ required: true, message: '상품명을 입력해주세요' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="interestRate"
                        label="금리"
                        rules={[{ required: true, message: '금리를 입력해주세요' }]}
                    >
                        <InputNumber min={0} max={100} step={0.1} />
                    </Form.Item>
                    <Form.Item
                        name="termMonths"
                        label="기간"
                        rules={[{ required: true, message: '기간을 입력해주세요' }]}
                    >
                        <InputNumber min={1} max={60} />
                    </Form.Item>
                    <Form.Item
                        name="minAmount"
                        label="최소 금액"
                        rules={[{ required: true, message: '최소 금액을 입력해주세요' }]}
                    >
                        <InputNumber min={0} step={10000} />
                    </Form.Item>
                    <Form.Item
                        name="maxAmount"
                        label="최대 금액"
                        rules={[{ required: true, message: '최대 금액을 입력해주세요' }]}
                    >
                        <InputNumber min={0} step={10000} />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="상태"
                        rules={[{ required: true, message: '상태를 선택해주세요' }]}
                    >
                        <Select>
                            <Select.Option value="ACTIVE">활성</Select.Option>
                            <Select.Option value="INACTIVE">비활성</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SavingsProduct;