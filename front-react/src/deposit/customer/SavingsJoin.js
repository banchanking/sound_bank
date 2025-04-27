// SavingsJoin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from '../../jwt/RefreshToken';
import '../../Css/depositcss/DepositJoin.css';

const SavingsJoin = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [monthlyAmount, setMonthlyAmount] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const customerId = getCustomerID();

    useEffect(() => {
        if (!customerId) {
            const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?");
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
            const response = await RefreshToken.get('/deposit/products/savings');
            setProducts(response.data);
        } catch (error) {
            console.error('적금 상품 조회 에러:', error);
            alert('적금 상품 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleProductChange = (e) => {
        const productId = parseInt(e.target.value);
        const product = products.find(p => p.id === productId);
        setSelectedProduct(product);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedProduct) {
            alert('적금 상품을 선택해주세요.');
            return;
        }
        if (!monthlyAmount || monthlyAmount < selectedProduct.minAmount) {
            alert(`최소 ${selectedProduct.minAmount.toLocaleString()}원 이상 납입해야 합니다.`);
            return;
        }
        if (!password || password.length !== 4) {
            alert('계좌 비밀번호를 4자리로 입력해주세요.');
            return;
        }

        try {
            await RefreshToken.post('/deposit/accounts/savings', {
                customerId,
                productId: selectedProduct.id,
                interestRate: selectedProduct.interestRate,
                accountPassword: password,
                monthlyAmount,
                maturityDate: calcMaturityDate(selectedProduct.termMonths),
            });

            alert('적금 계좌가 성공적으로 개설되었습니다.');
            navigate('/deposit/accounts');  // 가입 후 예적금 계좌 목록으로 이동
        } catch (error) {
            console.error('적금 계좌 개설 실패:', error);
            alert('적금 계좌 개설에 실패했습니다.');
        }
    };

    const calcMaturityDate = (termMonths) => {
        const now = new Date();
        now.setMonth(now.getMonth() + termMonths);
        return now.toISOString().split('T')[0];  // YYYY-MM-DD 포맷
    };

    return (
        <div className="depositContainer">
            <div className="depositCard">
                <div className="depositProductHeader">
                    <h2>적금 상품 가입</h2>
                </div>

                <form onSubmit={handleSubmit} className="depositForm">
                    <div className="formGroup">
                        <label>적금 상품 선택</label>
                        <select value={selectedProduct?.id || ''} onChange={handleProductChange} required>
                            <option value="">상품 선택</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.productName} - {product.interestRate}%
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedProduct && (
                        <>
                            <div className="formGroup">
                                <label>월 납입금액</label>
                                <input
                                    type="number"
                                    value={monthlyAmount}
                                    onChange={(e) => setMonthlyAmount(e.target.value)}
                                    min={selectedProduct.minAmount}
                                    required
                                />
                                <div className="formHint">
                                    최소 {selectedProduct.minAmount.toLocaleString()}원 이상
                                </div>
                            </div>

                            <div className="formGroup">
                                <label>계좌 비밀번호 (4자리)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    maxLength={4}
                                    required
                                />
                            </div>

                            <button type="submit" className="depositBtn" disabled={loading}>
                                적금 계좌 개설
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SavingsJoin;
