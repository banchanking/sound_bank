import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositComparison.css';

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
      const [depositRes, savingsRes] = await Promise.all([
        RefreshToken.get('/deposit/products/deposit'),
        RefreshToken.get('/deposit/products/savings')
      ]);

      const depositProducts = depositRes.data.map(p => ({
        ...p,
        id: p.id,
        name: p.productName || '상품명 없음',
        type: p.productType,
        baseRate: p.interestRate ?? 0,
        minAmount: p.minAmount ?? 0,
        maxAmount: p.maxAmount ?? 0,
        term: p.termMonths ?? 0,
        category: 'deposit'
      }));

      const savingsProducts = savingsRes.data.map(p => ({
        ...p,
        id: p.id,
        name: p.productName || '상품명 없음',
        type: p.productType,
        baseRate: p.interestRate ?? 0,
        minAmount: p.minAmount ?? 0,
        maxAmount: p.maxAmount ?? 0,
        term: p.termMonths ?? 0,
        category: 'savings'
      }));

      setProducts([...depositProducts, ...savingsProducts]);
    } catch (error) {
      console.error(error);
      alert('상품 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId, category) => {
    const selectedKey = `${category}_${productId}`;
    const selectedProduct = products.find(p => p.id === productId && p.category === category);
    const selectedType = selectedProduct?.type;

    setSelectedProducts(prev => {
      const details = products.filter(p => prev.includes(`${p.category}_${p.id}`));
      if (details.length > 0 && details[0].type !== selectedType) {
        alert('같은 유형끼리만 비교할 수 있습니다.');
        return prev;
      }

      if (prev.includes(selectedKey)) {
        return prev.filter(id => id !== selectedKey);
      }

      if (prev.length >= 2) {
        alert('2개까지만 선택할 수 있습니다.');
        return prev;
      }

      return [...prev, selectedKey];
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = productType === 'ALL' || product.type === productType;
    return matchesName && matchesType;
  });

  const selectedProductDetails = products.filter(p =>
    selectedProducts.includes(`${p.category}_${p.id}`)
  );

  const typeMap = {
    REGULAR: '일반예금',
    FIXED: '정기예금',
    INSTALLMENT: '적금',
    HOUSING: '주택청약',
    PENSION: '연금적금',
    YOUTH: '청년적금',
    regular: '일반예금',
    fixed: '정기예금',
    installment: '적금',
    housing: '주택청약',
    pension: '연금적금',
    youth: '청년적금'
  };

  const isDepositType = (type) =>
    ['REGULAR', 'FIXED', 'regular', 'fixed'].includes(type);

  return (
    <div className="depositComparison-container">
      <div className="depositComparison-card">
        <div className="depositComparison-header">
          <h3 className="depositComparison-title">예금 상품 비교</h3>
          <div className="depositComparison-selectArea">
            <select
              className="depositComparison-select"
              value={productType}
              onChange={e => {
                setProductType(e.target.value);
                setSelectedProducts([]);
              }}
            >
              <option value="ALL">전체</option>
              <option value="REGULAR">일반예금</option>
              <option value="FIXED">정기예금</option>
              <option value="INSTALLMENT">적금</option>
              <option value="HOUSING">주택청약</option>
              <option value="PENSION">연금적금</option>
            </select>
            <input
              type="text"
              className="depositComparison-input"
              placeholder="상품명 검색"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button className="depositComparison-btn" onClick={fetchProducts}>새로고침</button>
          </div>
        </div>

        <div className="depositComparison-content">
          <table className="depositComparison-table">
            <thead>
              <tr>
                <th>선택</th>
                <th>상품명</th>
                <th>유형</th>
                <th>이율</th>
                <th>최소금액</th>
                <th>최대금액</th>
                <th>기간</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7">로딩 중...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="7">검색 결과가 없습니다.</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={`${product.category}_${product.id}`} className="depositComparison-row">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(`${product.category}_${product.id}`)}
                        onChange={() => handleProductSelect(product.id, product.category)}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{typeMap[product.type] || product.type}</td>
                    <td>{product.baseRate}%</td>
                    <td>{(product.minAmount ?? 0).toLocaleString()}원</td>
                    <td>{(product.maxAmount ?? 0).toLocaleString()}원</td>
                    <td>{(product.term ?? 0)}개월</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedProductDetails.length === 2 && (
          <div className="depositComparison-details">
            <h4 className="depositComparison-subtitle">선택된 상품 비교</h4>
            <div className="depositComparison-grid">
              {selectedProductDetails.map((product, index) => {
                const opponent = selectedProductDetails[1 - index];
                return (
                  <div key={`${product.category}_${product.id}`} className="depositComparison-cardBox">
                    <h5>{product.name}</h5>
                    <p><strong>상품유형:</strong> {typeMap[product.type] || product.type}</p>
                    <p><strong>기본이율:</strong> {product.baseRate}%
                      {product.baseRate > opponent.baseRate && (
                        <span className="depositComparison-highlight"> 👍 높은 이율</span>
                      )}
                    </p>
                    <p><strong>최소금액:</strong> {(product.minAmount ?? 0).toLocaleString()}원
                      {product.minAmount < opponent.minAmount && (
                        <span className="depositComparison-highlight"> 👍 낮은 최소금액</span>
                      )}
                    </p>
                    <p><strong>최대금액:</strong> {(product.maxAmount ?? 0).toLocaleString()}원</p>
                    <p><strong>기간:</strong> {(product.term ?? 0)}개월</p>
                    <button
                      className="depositComparison-joinBtn"
                      onClick={() => {
                        const isDeposit = isDepositType(product.type);
                        navigate(isDeposit ? '/depositJoin' : '/savingsJoin', { state: { product } });
                      }}
                    >
                      가입하기
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositComparison;
