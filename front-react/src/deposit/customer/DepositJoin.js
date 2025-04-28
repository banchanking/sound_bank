import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositJoin.css';

const DepositJoin = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedWithdrawAccountNumber, setSelectedWithdrawAccount] = useState('');
    const [currentStep, setCurrentStep] = useState('select');
    const [amount, setAmount] = useState('');
    const [password, setPassword] = useState('');
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
        fetchAccounts();
    }, [customerId]);

    const fetchProducts = async () => {
        try {
            const response = await RefreshToken.get('/deposit/products/deposit');
            setProducts(response.data);
        } catch (error) {
            console.error('상품 조회 에러:', error);
            alert('상품 정보를 불러오는데 실패했습니다.');
        }
    };

    const fetchAccounts = async () => {
        try {
            const response = await RefreshToken.get(`/accounts/allAccount/${customerId}`);
            setAccounts(response.data['입출금'] || []); 
        } catch (error) {
            console.error('입출금 계좌 조회 실패:', error);
        }
    };
    

    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setCurrentStep('agreement');
    };

    const handleAgree = () => {
        setCurrentStep('form');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!amount || amount < selectedProduct.minAmount) {
            alert(`최소 ${selectedProduct.minAmount.toLocaleString()}원 이상 입금해야 합니다.`);
            return;
        }
        if (!password || password.length !== 4) {
            alert('계좌 비밀번호를 4자리로 입력해주세요.');
            return;
        }
        if (!selectedWithdrawAccountNumber) {
            alert('출금할 입출금 계좌를 선택해주세요.');
            return;
        }

        try {
            // 1단계: 예금 계좌 생성
            const createRes = await RefreshToken.post('/deposit/accounts/deposit', {
                customerId,
                productId: selectedProduct.id,
                balance: amount,
                accountPassword: password,
                withdrawalAccountNumber: selectedWithdrawAccountNumber      
            });
            

            const accountNumber = createRes.data.accountNumber || createRes.data.account_number;
            if (!accountNumber) {
                throw new Error('생성된 계좌번호를 가져오지 못했습니다.');
            }

            // 2단계: account_tbl에 추가
            await RefreshToken.post('/accounts/createDepositAccount', {
                accountNumber,
                customer_id: customerId,
                account_type: '예금',
                account_pwd: password,
                balance: amount,
                interest_rate: selectedProduct.interestRate,
                yield_rate: 0,
                currency_type: 'KRW',
                account_name: selectedProduct.productName,
                open_date: new Date()
            });

            alert('예금 계좌가 성공적으로 개설되었습니다.');
            navigate('/');
        } catch (error) {
            console.error('계좌 개설 실패:', error);
            alert('계좌 개설에 실패했습니다.');
        }
    };

    const handleCancel = () => {
        setCurrentStep('select');
        setSelectedProduct(null);
        setAmount('');
        setPassword('');
    };

    return (
        <div className="depositContainer">
            {currentStep === 'select' && (
                <>
                    <div className="depositProductHeader">
                        <h2>예금 상품 선택</h2>
                    </div>
                    <div className="productList">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="productCard"
                                onClick={() => handleProductClick(product)}
                            >
                                <h3>{product.productName}</h3>
                                <p>이자율: {product.interestRate}%</p>
                                <p>기간: {product.termMonths}개월</p>
                                <p>최소금액: {product.minAmount.toLocaleString()}원</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {currentStep === 'agreement' && selectedProduct && (
                <div className="depositCard">
                    <div className="depositProductHeader">
                        <h2>가입 동의</h2>
                    </div>
                    <div>
                        <h3>상품명</h3>
                        <p>{selectedProduct.productName}</p>
                        <h3>상품 설명</h3>
                        <p>{selectedProduct.productDescription || "상품 설명이 없습니다."}</p>

                        <h3>약관</h3>
                        <p>본 상품은 예금자 보호법에 따라 보호됩니다. 금리 변동 등에 주의하시기 바랍니다.</p>
                    </div>
                    <div style={{ marginTop: '20px' }}>
                        <button className="depositBtn" onClick={handleAgree}>동의하고 가입하기</button>
                        <button className="depositBtn" style={{ marginLeft: '10px', backgroundColor: '#aaa' }} onClick={handleCancel}>취소</button>
                    </div>
                </div>
            )}

            {currentStep === 'form' && selectedProduct && (
                <div className="depositCard">
                    <div className="depositProductHeader">
                        <h2>가입 정보 입력</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="depositForm">
                        <div className="formGroup">
                            <label>초기 입금액</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min={selectedProduct.minAmount}
                                required
                            />
                            <div className="formHint">
                                최소 입금액: {selectedProduct.minAmount.toLocaleString()}원
                            </div>
                        </div>

                        <div className="formGroup">
                            <label>출금 계좌 선택</label>
                            <select
                                value={selectedWithdrawAccountNumber}
                                onChange={(e) => setSelectedWithdrawAccount(e.target.value)}
                                required
                            >
                                <option value="">출금할 입출금 계좌를 선택하세요</option>
                                {accounts.map(acc => (
                                    <option key={acc.account_number} value={acc.account_number}>
                                        {acc.account_name} ({acc.account_number}) - 잔액: {acc.balance.toLocaleString()}원
                                    </option>
                                ))}
                            </select>
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

                        <button type="submit" className="depositBtn">가입 완료</button>
                        <button
                            type="button"
                            className="depositBtn"
                            style={{ backgroundColor: '#aaa', marginLeft: '10px' }}
                            onClick={handleCancel}
                        >
                            취소
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DepositJoin;
