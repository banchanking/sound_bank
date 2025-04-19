import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../Css/Deposit/DepositJoin.css';

const DepositJoin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { product } = location.state || {};
    const [formData, setFormData] = useState({
        productId: product?.id || '',
        accountNumber: '',
        depositAmount: '',
        term: '',
        interestPaymentMethod: '만기일시지급',
        maturityWithdrawalMethod: '자동이체'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (!product) {
            navigate('/deposit');
        }
    }, [product, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:8081/api/deposit/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    customerId: localStorage.getItem('customerId')
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '예금 계좌 개설에 실패했습니다.');
            }

            setSuccess('예금 계좌가 성공적으로 개설되었습니다.');
            setTimeout(() => {
                navigate('/accountOverview');
            }, 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="deposit-join-container">
            <h1 className="deposit-join-title">예금 상품 가입</h1>
            <div className="join-form">
                <div className="product-info">
                    <h2 className="section-title">상품 정보</h2>
                    <div className="info-row">
                        <span className="info-label">상품명:</span>
                        <span className="info-value">{product?.name}</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">이자율:</span>
                        <span className="info-value">{product?.interestRate}%</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">최대 이자율:</span>
                        <span className="info-value">{product?.maxInterestRate}%</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">기간:</span>
                        <span className="info-value">{product?.term}개월</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h2 className="section-title">가입 정보</h2>
                        <div className="form-group">
                            <label className="form-label">계좌번호</label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">예금 금액</label>
                            <input
                                type="number"
                                name="depositAmount"
                                value={formData.depositAmount}
                                onChange={handleChange}
                                className="form-input"
                                required
                                min={product?.minAmount}
                                max={product?.maxAmount}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">이자 지급 방법</label>
                            <select
                                name="interestPaymentMethod"
                                value={formData.interestPaymentMethod}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="만기일시지급">만기일시지급</option>
                                <option value="월이자지급">월이자지급</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">만기 해지 방법</label>
                            <select
                                name="maturityWithdrawalMethod"
                                value={formData.maturityWithdrawalMethod}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="자동이체">자동이체</option>
                                <option value="수동해지">수동해지</option>
                            </select>
                        </div>
                    </div>

                    <div className="button-group">
                        <button type="submit" className="action-button submit-button">
                            가입하기
                        </button>
                        <button 
                            type="button" 
                            className="action-button cancel-button"
                            onClick={() => navigate('/deposit')}
                        >
                            취소
                        </button>
                    </div>
                </form>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}
            </div>
        </div>
    );
};

export default DepositJoin; 