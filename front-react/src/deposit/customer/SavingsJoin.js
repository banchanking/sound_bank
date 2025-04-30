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
  const [calcResult, setCalcResult] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedWithdrawAccountNumber, setSelectedWithdrawAccountNumber] = useState('');
  const [currentStep, setCurrentStep] = useState('select');

  const customerId = getCustomerID();

  const handleMonthlyAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value) value = parseInt(value, 10).toLocaleString('ko-KR');
    setMonthlyAmount(value);
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
  }, [customerId]);

  const fetchProducts = async () => {
    try {
      const response = await RefreshToken.get('/deposit/products/savings');
      setProducts(response.data);
    } catch (error) {
      alert('적금 상품을 불러오는데 실패했습니다.');
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await RefreshToken.get(`/accounts/allAccount/${customerId}`);
      setAccounts(res.data['입출금'] || []);
    } catch (error) {
      alert('입출금 계좌를 불러오는데 실패했습니다.');
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentStep('agreement');
  };

  const handleAgree = () => {
    setCurrentStep('form');
  };

  const calculateSavings = () => {
    if (!monthlyAmount || !selectedProduct) return;
    const monthly = Number(monthlyAmount.replace(/,/g, ''));
    const months = selectedProduct.termMonths;
    const rate = selectedProduct.interestRate / 100;
    const taxRate = 0.154;

    const totalPrincipal = monthly * months;
    const interest = (monthly * months * (months + 1) / 24) * rate;
    const afterTaxInterest = interest * (1 - taxRate);
    const maturityAmount = totalPrincipal + afterTaxInterest;

    setCalcResult({
      totalPrincipal: Math.floor(totalPrincipal),
      interest: Math.floor(interest),
      afterTaxInterest: Math.floor(afterTaxInterest),
      maturityAmount: Math.floor(maturityAmount)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await RefreshToken.post('/deposit/accounts/savings', {
        customerId,
        productId: selectedProduct.id,
        interestRate: selectedProduct.interestRate,
        accountPassword: password,
        monthlyAmount: Number(monthlyAmount.replace(/,/g, '')),
        maturityDate: calcMaturityDate(selectedProduct.termMonths),
        withdrawalAccountNumber: selectedWithdrawAccountNumber,
        withdrawalAmount: Number(monthlyAmount.replace(/,/g, ''))
      });
      alert('적금 계좌가 성공적으로 개설되었습니다.');
      navigate('/');
    } catch (error) {
      alert('적금 계좌 개설에 실패했습니다.');
    }
  };

  const calcMaturityDate = (termMonths) => {
    const now = new Date();
    now.setMonth(now.getMonth() + termMonths);
    return now.toISOString().split('T')[0];
  };

  return (
    <div className="deposit-container">
      {currentStep === 'select' && (
        <>
          <div className="deposit-header">
            <h2>적금 상품 선택</h2>
          </div>
          <div className="deposit-product-list">
            {products.map(product => (
              <div key={product.id} className="deposit-product-card" onClick={() => handleProductClick(product)}>
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
        <div className="deposit-card">
          <div className="deposit-header">
            <h2>가입 동의</h2>
          </div>

          <table className="deposit-agree-table">
            <tbody>
                <tr>
                <th>상품명</th>
                <td>{selectedProduct.productName}</td>
                </tr>
                <tr>
                <th>상품 설명</th>
                <td>{selectedProduct.productDescription || '상품 설명이 없습니다.'}</td>
                </tr>
                <tr>
                <th>약관</th>
                <td>
                    본 상품은 예금자 보호법에 따라 보호됩니다. 금리 변동 등에 주의하시기 바랍니다.
                </td>
                </tr>
            </tbody>
            </table>


          <div className="deposit-agree-buttons">
            <button className="deposit-btn-primary" onClick={handleAgree}>동의하고 가입하기</button>
            <button className="deposit-btn-cancel" onClick={() => setCurrentStep('select')}>취소</button>
          </div>
        </div>
      )}

      {currentStep === 'form' && selectedProduct && (
        <div className="deposit-card">
          <div className="deposit-header">
            <h2>가입 정보 입력</h2>
          </div>
          <form onSubmit={handleSubmit} className="deposit-form">

            <div className="deposit-flex-inputs">
              <div className="deposit-flex-column deposit-form-group">
                <label>월 납입 금액</label>
                <div className="deposit-input-group">
                  <input
                    type="text"
                    value={monthlyAmount}
                    onChange={handleMonthlyAmountChange}
                    className="deposit-input"
                    required
                  />
                  <span className="deposit-unit">원</span>
                </div>
                {selectedProduct && (
                  <div className="deposit-hint">
                    최소 {selectedProduct.minAmount.toLocaleString()}원 이상
                  </div>
                )}
              </div>

              <div className="deposit-flex-column deposit-form-group">
                <label>적금 계산기</label>
                <button type="button" className="deposit-btn-primary" onClick={calculateSavings}>계산하기</button>
                {calcResult && (
                  <div className="deposit-calc-result">
                    <div>총 납입금액: {calcResult.totalPrincipal.toLocaleString()}원</div>
                    <div>세전 이자: {calcResult.interest.toLocaleString()}원</div>
                    <div>세후 이자: {calcResult.afterTaxInterest.toLocaleString()}원</div>
                    <div>만기 수령액: {calcResult.maturityAmount.toLocaleString()}원</div>
                  </div>
                )}
              </div>
            </div>

            <div className="deposit-form-group">
              <label>출금 계좌 선택</label>
              <select
                value={selectedWithdrawAccountNumber}
                onChange={(e) => setSelectedWithdrawAccountNumber(e.target.value)}
                className="deposit-select"
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

            <div className="deposit-form-group">
              <label>계좌 비밀번호 (4자리)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={4}
                className="deposit-inputPassword"
                required
              />
            </div>

            <div className="deposit-submit-buttons">
              <button type="submit" className="deposit-btn-primary2">적금 계좌 개설</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SavingsJoin;
