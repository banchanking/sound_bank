import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../Css/depositcss/SavingsAgreement.css';

const SavingsAgreement = () => {
    const navigate = useNavigate();
    const [isAgreed, setIsAgreed] = useState(false);

    const handleAgreementChange = (e) => {
        setIsAgreed(e.target.checked);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isAgreed) {
            alert('약관에 동의해주세요.');
            return;
        }
        navigate('/deposit/savings/join');
    };

    return (
        <div className="depositContainer">
            <div className="depositCard">
                <div className="depositProductHeader">
                    <h2>적금 상품 약관 동의</h2>
                </div>

                <div className="agreementContent">
                    <h3>적금 상품 이용약관</h3>
                    <div className="agreementText">
                        <p>1. 본 상품은 예금자보호법에 따라 보호됩니다.</p>
                        <p>2. 이자율, 만기, 중도해지 등 상품별 세부조건을 반드시 확인하세요.</p>
                        <p>3. 금융사고 예방을 위해 비밀번호는 타인에게 노출하지 마세요.</p>
                        <p>4. 기타 자세한 사항은 상품설명서 및 은행 홈페이지를 참고하세요.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="depositForm">
                        <div className="formGroup">
                            <label className="agreementCheckbox">
                                <input
                                    type="checkbox"
                                    checked={isAgreed}
                                    onChange={handleAgreementChange}
                                />
                                <span>위 약관에 동의합니다.</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="depositBtn"
                            disabled={!isAgreed}
                        >
                            다음
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SavingsAgreement; 