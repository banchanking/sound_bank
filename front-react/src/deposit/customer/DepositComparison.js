import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Input, Button, Space, Typography, Tabs } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositComparison.css';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DepositComparison = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [productType, setProductType] = useState('ALL');
    const [comparisonResult, setComparisonResult] = useState([]);

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
            setLoading(true);
            const [depositResponse, savingsResponse] = await Promise.all([
                RefreshToken.get('/deposit/products/deposit'),
                RefreshToken.get('/deposit/products/savings')
            ]);
            setProducts([...depositResponse.data, ...savingsResponse.data]);
        } catch (error) {
            console.error('상품 조회 에러:', error);
            console.error('상품 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelect = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            if (selectedProducts.length < 3) {
                setSelectedProducts([...selectedProducts, productId]);
            } else {
                 console.warning('최대 3개의 상품만 비교할 수 있습니다.');
            }
        }
    };

    const filteredProducts = products.filter(product => {
        const productName = product?.name || '';
        const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = productType === 'ALL' || product?.type === productType;
        return matchesSearch && matchesType;
    });

    const columns = [
        {
            title: '상품명',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <input
                        type="checkbox"
                        checked={selectedProducts.includes(record.id)}
                        onChange={() => handleProductSelect(record.id)}
                    />
                    {text || '상품명 없음'}
                </Space>
            ),
        },
        {
            title: '상품유형',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                const typeMap = {
                    REGULAR: '일반예금',
                    FIXED: '정기예금',
                    INSTALLMENT: '적금'
                };
                return typeMap[type] || type || '유형 없음';
            }
        },
        {
            title: '기본이율',
            dataIndex: 'baseRate',
            key: 'baseRate',
            render: (rate) => `${rate || 0}%`
        },
        {
            title: '우대이율',
            dataIndex: 'preferentialRate',
            key: 'preferentialRate',
            render: (rate) => `${rate || 0}%`
        },
        {
            title: '최소금액',
            dataIndex: 'minAmount',
            key: 'minAmount',
            render: (amount) => `${(amount || 0).toLocaleString()}원`
        },
        {
            title: '최대금액',
            dataIndex: 'maxAmount',
            key: 'maxAmount',
            render: (amount) => `${(amount || 0).toLocaleString()}원`
        },
        {
            title: '기간',
            dataIndex: 'term',
            key: 'term',
            render: (term) => `${term || 0}개월`
        }
    ];

    const comparisonColumns = [
        {
            title: '비교항목',
            dataIndex: 'item',
            key: 'item',
            width: 150
        },
        ...selectedProducts.map(productId => {
            const product = products.find(p => p.id === productId);
            return {
                title: product?.name || '',
                dataIndex: `product_${productId}`,
                key: `product_${productId}`,
                render: (value) => {
                    if (typeof value === 'number') {
                        return value.toLocaleString();
                    }
                    return value;
                }
            };
        })
    ];

    const comparisonData = [
        {
            key: 'type',
            item: '상품유형',
            ...selectedProducts.reduce((acc, productId) => {
                const product = products.find(p => p.id === productId);
                acc[`product_${productId}`] = product?.type || '';
                return acc;
            }, {})
        },
        {
            key: 'rate',
            item: '기본이율',
            ...selectedProducts.reduce((acc, productId) => {
                const product = products.find(p => p.id === productId);
                acc[`product_${productId}`] = `${product?.baseRate}%`;
                return acc;
            }, {})
        },
        {
            key: 'preferential',
            item: '우대이율',
            ...selectedProducts.reduce((acc, productId) => {
                const product = products.find(p => p.id === productId);
                acc[`product_${productId}`] = `${product?.preferentialRate}%`;
                return acc;
            }, {})
        },
        {
            key: 'min',
            item: '최소금액',
            ...selectedProducts.reduce((acc, productId) => {
                const product = products.find(p => p.id === productId);
                acc[`product_${productId}`] = `${product?.minAmount.toLocaleString()}원`;
                return acc;
            }, {})
        },
        {
            key: 'max',
            item: '최대금액',
            ...selectedProducts.reduce((acc, productId) => {
                const product = products.find(p => p.id === productId);
                acc[`product_${productId}`] = `${product?.maxAmount.toLocaleString()}원`;
                return acc;
            }, {})
        },
        {
            key: 'term',
            item: '기간',
            ...selectedProducts.reduce((acc, productId) => {
                const product = products.find(p => p.id === productId);
                acc[`product_${productId}`] = `${product?.term}개월`;
                return acc;
            }, {})
        }
    ];

    const handleCompare = async () => {
        try {
            const response = await RefreshToken.post('/deposit/products/compare', {
                productIds: selectedProducts
            });
            setComparisonResult(response.data);
        } catch (error) {
            console.error('상품 비교 에러:', error);
            console.error('상품 비교에 실패했습니다.');
        }
    };
    return (
        <div className="depositContainer">
            <Card>
                <div className="depositComparisonHeader">
                    <Title level={3}>예금 상품 비교</Title>
                    <Space>
                        <Select
                            value={productType}
                            onChange={setProductType}
                            style={{ width: 120 }}
                        >
                            <Option value="ALL">전체</Option>
                            <Option value="REGULAR">일반예금</Option>
                            <Option value="FIXED">정기예금</Option>
                            <Option value="INSTALLMENT">적금</Option>
                        </Select>
                        <Input
                            placeholder="상품명 검색"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: 200 }}
                            prefix={<SearchOutlined />}
                        />
                        <Button
                            onClick={fetchProducts}
                        >
                            새로고침
                        </Button>
                    </Space>
                </div>

                <div className="depositComparisonContent">
                    <Table
                        columns={columns}
                        dataSource={filteredProducts}
                        loading={loading}
                        rowKey="id"
                        pagination={false}
                    />

                    {selectedProducts.length > 0 && (
                        <div className="depositComparisonTable">
                            <Title level={4}>선택한 상품 비교</Title>
                            <Table
                                columns={comparisonColumns}
                                dataSource={comparisonData}
                                pagination={false}
                            />
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DepositComparison;