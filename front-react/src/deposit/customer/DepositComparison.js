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
                if (goLogin) {
                    navigate("/login");
                  } else {
                    navigate("/");
                  }
                  return;      
            }
            fetchProducts();
        }, [navigate, customerId]);

      

    const fetchProducts = async () => {
        try {
            setLoading(true);

            // API 호출
            const [depositResponse, savingsResponse] = await Promise.all([
                RefreshToken.get('/deposit/products/deposit'),
                RefreshToken.get('/deposit/products/savings')
            ]);

            // API 응답 데이터 로그 출력
            console.log('예금 상품 데이터:', depositResponse.data);
            console.log('적금 상품 데이터:', savingsResponse.data);

            // 예금 상품 매핑
            const depositProducts = depositResponse.data.map(product => {
                console.log('예금 상품 매핑 전 데이터:', product);
                return {
                    id: `deposit_${product.product_id || `random_${Math.random()}`}`, // product_id가 없으면 고유한 랜덤 값 생성
                    name: product.product_name || product.name || '상품명 없음', // 상품명을 나타내는 필드 수정
                    type: product.product_type || '유형 없음',
                    baseRate: product.interest_rate || 0,
                    minAmount: product.min_amount || 0,
                    maxAmount: product.max_amount || 0,
                    term: product.term_months || 0
                };
            });

            // 적금 상품 매핑
            const savingsProducts = savingsResponse.data.map(product => {
                console.log('적금 상품 매핑 전 데이터:', product);
                return {
                    id: `savings_${product.product_id || `random_${Math.random()}`}`, // product_id가 없으면 고유한 랜덤 값 생성
                    name: product.product_name || product.name || '상품명 없음', // 상품명을 나타내는 필드 수정
                    type: product.product_type || '유형 없음',
                    baseRate: product.interest_rate || 0,
                    minAmount: product.min_amount || 0,
                    maxAmount: product.max_amount || 0,
                    term: product.term_months || 0
                };
            });

            // 매핑된 데이터 로그 출력
            console.log('예금 상품 변환 데이터:', depositProducts);
            console.log('적금 상품 변환 데이터:', savingsProducts);

            const allProducts = [...depositProducts, ...savingsProducts];
            console.log('최종 설정될 products 상태:', allProducts);

            setProducts(allProducts);
        } catch (error) {
            console.error('상품 조회 에러:', error);
            alert('상품 데이터를 불러오는 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleProductSelect = (productId) => {
        setSelectedProducts((prevSelectedProducts) => {
            if (prevSelectedProducts.includes(productId)) {
                console.log(`상품 선택 해제: ${productId}`);
                return prevSelectedProducts.filter(id => id !== productId);
            } else {
                if (prevSelectedProducts.length < 3) {
                    console.log(`상품 선택: ${productId}`);
                    return [...prevSelectedProducts, productId];
                } else {
                    console.warn('최대 3개의 상품만 비교할 수 있습니다.');
                    return prevSelectedProducts;
                }
            }
        });
    };

    const filteredProducts = products.filter(product => {
        const productName = product?.name || '';
        const matchesSearch = !searchTerm || productName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = productType === 'ALL' || product?.type === productType;

        // 필터링 조건 로그 출력
        console.log('상품 이름:', productName);
        console.log('검색 조건 일치:', matchesSearch);
        console.log('유형 조건 일치:', matchesType);

        return matchesSearch && matchesType;
    });

    // 필터링된 데이터 로그 출력
    console.log('필터링된 상품 데이터:', filteredProducts);

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
                    {text}
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

    const selectedProductDetails = products.filter(product =>
        selectedProducts.includes(product.id)
    );

    // 선택된 상품 데이터 로그 출력
    console.log('선택된 상품 데이터:', selectedProductDetails);

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
                        rowKey={(record) => record.id || `random_${Math.random()}`} // 고유한 키 보장
                        pagination={false}
                    />
                </div>

                {selectedProductDetails.length > 0 && (
                    <div className="comparisonDetails">
                        <Title level={4}>선택된 상품 비교</Title>
                        <Table
                            columns={columns}
                            dataSource={selectedProductDetails}
                            pagination={false}
                            rowKey={(record) => record.id || `random_${Math.random()}`} // 고유한 키 보장
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DepositComparison;