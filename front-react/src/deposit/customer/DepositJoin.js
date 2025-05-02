// DepositJoin.jsx (전체 소스)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositJoin.css';

const DepositJoin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const productIdFromQuery = query.get("productId");
  const passedProduct = location.state?.product;

  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWithdrawAccountNumber, setSelectedWithdrawAccount] = useState('');
  const [currentStep, setCurrentStep] = useState('select');
  const [amount, setAmount] = useState('');
  const [calcAmount, setCalcAmount] = useState('');
  const [password, setPassword] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const customerId = getCustomerID();

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) value = parseInt(value, 10).toLocaleString('ko-KR');
    setAmount(value);
  };

  const handleCalcAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) value = parseInt(value, 10).toLocaleString('ko-KR');
    setCalcAmount(value);
  };

  useEffect(() => {
    if (!customerId) {
      const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동할까요?");
      if (goLogin) navigate("/login");
      else navigate("/");
      return;
    }
    fetchProducts();
    fetchAccounts();
    if (passedProduct) {
      setSelectedProduct(passedProduct);
      setCurrentStep('agreement');
    }
  }, [customerId]);

  const fetchProducts = async () => {
    try {
      const response = await RefreshToken.get('/deposit/products/deposit');
      setProducts(response.data);
      if (productIdFromQuery) {
        const matched = response.data.find(p => String(p.id) === productIdFromQuery);
        if (matched) {
          setSelectedProduct(matched);
          setCurrentStep('agreement');
        }
      }
    } catch {
      alert('상품 정보를 불러오는데 실패했습니다.');
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await RefreshToken.get(`/accounts/allAccount/${customerId}`);
      setAccounts(response.data['입출금'] || []);
    } catch {
      alert('입출금 계좌를 불러오는데 실패했습니다.');
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentStep('agreement');
  };

  const handleAgree = () => setCurrentStep('form');

  const calculateInterest = () => {
    if (!calcAmount || !selectedProduct) return;
    const principal = Number(calcAmount.replace(/,/g, ''));
    const rate = selectedProduct.interestRate / 100;
    const months = selectedProduct.termMonths;
    const taxRate = 0.154;

    const interest = principal * rate * (months / 12);
    const afterTaxInterest = interest * (1 - taxRate);
    const total = principal + afterTaxInterest;

    setCalcResult({
      interest: Math.floor(interest),
      afterTaxInterest: Math.floor(afterTaxInterest),
      total: Math.floor(total)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount.replace(/,/g, '')) < selectedProduct.minAmount) {
      alert(`최소 ${selectedProduct.minAmount?.toLocaleString() ?? 0}원 이상 입금해야 합니다.`);
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
      await RefreshToken.post('/deposit/accounts/deposit', {
        customerId,
        productId: selectedProduct.id,
        balance: Number(amount.replace(/,/g, '')),
        accountPassword: password,
        withdrawalAccountNumber: selectedWithdrawAccountNumber
      });
      alert('예금 계좌가 성공적으로 개설되었습니다.');
      navigate('/');
    } catch {
      alert('계좌 개설에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setCurrentStep('select');
    setSelectedProduct(null);
    setAmount('');
    setPassword('');
    setCalcAmount('');
    setCalcResult(null);
  };

  return (
    <div className="deposit-container">
      {currentStep === 'select' && (
        <>
          <div className="deposit-header">
            <h2>예금 상품 선택</h2>
          </div>
          <div className="deposit-product-list">
            {products.map(product => (
              <div key={product.id} className="deposit-product-card" onClick={() => handleProductClick(product)}>
                <h3>{product.productName}</h3>
                <p>이자율: {product.interestRate}%</p>
                <p>기간: {product.termMonths}개월</p>
                <p>최소금액: {product.minAmount?.toLocaleString() ?? '0'}원</p>
              </div>
            ))}
          </div>
        </>
      )}

      {currentStep === 'agreement' && selectedProduct && (
        <div className="deposit-card">
          <div className="deposit-header">
            <h2>가입 동의</h2>
          </div>
          <table className="deposit-agree-table">
            <tbody>
              <tr><th>상품명</th><td>{selectedProduct.productName}</td></tr>
              <tr><th>상품 설명</th><td>{selectedProduct.productDescription || '상품 설명이 없습니다.'}</td></tr>
              <tr><th>약관</th><td>본 상품은 예금자 보호법에 따라 보호됩니다. 금리 변동 등에 주의하시기 바랍니다.</td></tr>
            </tbody>
          </table>
          <div className="deposit-agree-buttons">
            <button className="deposit-btn-primary" onClick={handleAgree}>동의하고 가입하기</button>
            <button className="deposit-btn-cancel" onClick={handleCancel}>취소</button>
          </div>
        </div>
      )}

      {currentStep === 'form' && selectedProduct && (
        <div className="deposit-card">
          <div className="deposit-header">
            <h2>가입 정보 입력</h2>
          </div>
          <div className="deposit-selected-product" style={{ marginBottom: '15px', fontWeight: 'bold' }}>
          선택한 상품: {selectedProduct.productName}
        </div>
          <form onSubmit={handleSubmit} className="deposit-form">
            <div className="deposit-flex-inputs">
              <div className="deposit-flex-column deposit-form-group">
                <label>초기 입금액</label>
                <div className="deposit-input-group">
                  <input type="text" value={amount} onChange={handleAmountChange} className="deposit-input" required />
                  <span className="deposit-unit">원</span>
                </div>
                <div className="deposit-hint">최소 입금액: {selectedProduct.minAmount?.toLocaleString() ?? '0'}원</div>
              </div>
              <div className="deposit-flex-column deposit-form-group">
                <label>예금 계산기</label>
                <div className="deposit-input-group">
                  <input type="text" value={calcAmount} onChange={handleCalcAmountChange} className="deposit-input" placeholder="금액 입력" />
                  <span className="deposit-unit">원</span>
                </div>
                <div className="deposit-rate-info">
                  <div>이자율: {selectedProduct.interestRate}%</div>
                  <div>예치기간: {selectedProduct.termMonths}개월</div>
                </div>
                <button type="button" onClick={calculateInterest} className="deposit-btn-primary">계산하기</button>
                {calcResult && (
                  <div className="deposit-calc-result">
                    <div>총 이자 (세전): {calcResult.interest?.toLocaleString() ?? '0'}원</div>
                    <div>세후 수령 이자: {calcResult.afterTaxInterest?.toLocaleString() ?? '0'}원</div>
                    <div>총 수령액: {calcResult.total?.toLocaleString() ?? '0'}원</div>
                  </div>
                )}
              </div>
            </div>

            <div className="deposit-form-group">
              <label>출금 계좌 선택</label>
              <select value={selectedWithdrawAccountNumber} onChange={e => setSelectedWithdrawAccount(e.target.value)} className="deposit-select" required>
                <option value="">출금할 입출금 계좌를 선택하세요</option>
                {accounts.map(acc => (
                  <option key={acc.account_number || acc.accountNumber} value={acc.account_number || acc.accountNumber}>
                    {(acc.account_name || acc.accountName || '')} ({acc.account_number || acc.accountNumber}) - 잔액: {(acc.balance != null ? acc.balance.toLocaleString() : '0')}원
                  </option>
                ))}
              </select>
            </div>

            <div className="deposit-form-group">
              <label>계좌 비밀번호 (4자리)</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} maxLength={4} className="deposit-inputPassword" required />
            </div>

            <div className="deposit-submit-buttons">
              <button type="submit" className="deposit-btn-primary2">가입 완료</button>
              <button type="button" className="deposit-btn-cancel" onClick={handleCancel}>취소</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DepositJoin;
