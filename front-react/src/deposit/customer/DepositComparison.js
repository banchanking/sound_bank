import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Input, Button, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositComparison.css';

const { Title } = Typography;
const { Option } = Select;

const DepositComparison = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [productType, setProductType] = useState('ALL');
    const customerId = getCustomerID();

    useEffect(() => {
        if (!customerId) {
            const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
            if (goLogin) navigate("/login");
            else navigate("/");
            return;
        }
        fetchProducts();
    }, [navigate, customerId]);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const [depositResponse, savingsResponse] = await Promise.all([
                RefreshToken.get('/deposit/products/deposit'),
                RefreshToken.get('/deposit/products/savings')
            ]);

            const depositProducts = (depositResponse.data || []).map(product => ({
                id: `deposit_${product.id || product.productId || Math.random()}`,
                name: product.name || product.productName || '상품명 없음',
                type: product.type || product.productType || '유형 없음',
                baseRate: product.interestRate || product.baseRate || 0,
                minAmount: product.minAmount || 0,
                maxAmount: product.maxAmount || 0,
                term: product.termMonths || product.term || 0
            }));

            const savingsProducts = (savingsResponse.data || []).map(product => ({
                id: `savings_${product.id || product.productId || Math.random()}`,
                name: product.name || product.productName || '상품명 없음',
                type: product.type || product.productType || '유형 없음',
                baseRate: product.interestRate || product.baseRate || 0,
                minAmount: product.minAmount || 0,
                maxAmount: product.maxAmount || 0,
                term: product.termMonths || product.term || 0
            }));

            const allProducts = [...depositProducts, ...savingsProducts];
            setProducts(allProducts);
        } catch (error) {
            console.error('상품 조회 에러:', error);
            alert('상품 데이터를 불러오는 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelect = (productId) => {
        const selectedProduct = products.find(product => product.id === productId);
        const selectedType = selectedProduct?.type;

        setSelectedProducts(prevSelectedProducts => {
            const selectedDetails = products.filter(p => prevSelectedProducts.includes(p.id));
            if (selectedDetails.length > 0 && selectedDetails[0].type !== selectedType) {
                alert('같은 상품 종류끼리만 비교할 수 있습니다.');
                return prevSelectedProducts;
            }

            if (prevSelectedProducts.includes(productId)) {
                return prevSelectedProducts.filter(id => id !== productId);
            }

            if (prevSelectedProducts.length >= 2) {
                alert('2개까지만 선택할 수 있습니다.');
                return prevSelectedProducts;
            }

            return [...prevSelectedProducts, productId];
        });
    };

    const filteredProducts = products.filter(product => {
        const productName = product?.name || '';
        const matchesSearch = !searchTerm || productName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = productType === 'ALL' || product?.type === productType;
        return matchesSearch && matchesType;
    });

    const selectedProductDetails = products.filter(product => selectedProducts.includes(product.id));

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
                            <Option value="HOUSING">주택청약</Option>
                            <Option value="PENSION">연금적금</Option>
                        </Select>
                        <Input
                            placeholder="상품명 검색"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: 200 }}
                            prefix={<SearchOutlined />}
                        />
                        <Button onClick={fetchProducts} className="depositBtn">
                            새로고침
                        </Button>
                    </Space>
                </div>

                <div className="depositComparisonContent">
                    <Table
                        columns={[
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
                                        {text}
                                    </Space>
                                )
                            },
                            {
                                title: '상품유형',
                                dataIndex: 'type',
                                key: 'type',
                                render: (type) => {
                                  const typeMap = {
                                    REGULAR: '일반예금',
                                    FIXED: '정기예금',
                                    INSTALLMENT: '적금',
                                    HOUSING: '주택청약',
                                    PENSION: '연금적금',
                                    YOUTH: '청년적금'

                                  };
                                  return typeMap[type] || type || '유형 없음';
                                }
                              }
                              ,
                            {
                                title: '기본이율',
                                dataIndex: 'baseRate',
                                key: 'baseRate',
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
                        ]}
                        dataSource={filteredProducts}
                        loading={loading}
                        rowKey={(record) => record.id}
                        pagination={{ pageSize: 10 }}   
                    />
                </div>

                {selectedProductDetails.length === 2 && (
                    <div className="comparisonDetails">
                        <Title level={4}>선택된 상품 비교</Title>
                        <div className="comparisonGrid">
                            {selectedProductDetails.map((product, index) => {
                                const opponent = selectedProductDetails[1 - index];
                                return (
                                    <Card
                                        key={product.id}
                                        title={product.name}
                                        bordered
                                        style={{ width: 300 }}
                                        >
                                        <p><strong>상품유형:</strong> {
                                            {
                                            REGULAR: '일반예금',
                                            FIXED: '정기예금',
                                            INSTALLMENT: '적금',
                                            HOUSING: '주택청약',
                                            PENSION: '연금적금',
                                            YOUTH: '청년적금'
                                            }[product.type] || product.type
                                        }</p>
                                        <p><strong>기본이율:</strong> {product.baseRate}% 
                                            {product.baseRate > opponent.baseRate && <span style={{ color: 'green' }}> 👍 높은 이율</span>}
                                        </p>
                                        <p><strong>최소금액:</strong> {product.minAmount.toLocaleString()}원
                                            {product.minAmount < opponent.minAmount && <span style={{ color: 'green' }}> 👍 낮은 최소금액</span>}
                                        </p>
                                        <p><strong>최대금액:</strong> {product.maxAmount.toLocaleString()}원</p>
                                        <p><strong>기간:</strong> {product.term}개월</p>
                                        </Card>

                                );
                            })}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DepositComparison;
