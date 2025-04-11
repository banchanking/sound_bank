import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken"; // 인증 포함된 인스턴스 사용

const FundRecommend = () => {
    const [funds, setFunds] = useState([]);
    const customerId = localStorage.getItem("customer_id"); // 로그인된 사용자 ID 가져오기

    useEffect(() => {
        const fetchRecommendedFunds = async () => {
            try {
                const response = await RefreshToken.get(`http://localhost:8081/api/fundRecommend/${customerId}`);
                setFunds(response.data); // 추천 펀드 목록 설정
            } catch (error) {
                console.error("펀드 추천 목록을 가져오는 중 오류 발생:", error);
            }
        };

        if (customerId) {
            fetchRecommendedFunds();
        }
    }, [customerId]);

    return (
        <div>
            <h1>추천 펀드 목록</h1>
            {funds.length > 0 ? (
                <ul>
                    {funds.map((fund) => (
                        <li key={fund.fund_id}>
                            <h3>{fund.fund_name}</h3>
                            <p>1개월 누적 수익률: {fund.return_1m}%</p>
                            <p>3개월 누적 수익률: {fund.return_3m}%</p>
                            <p>6개월 누적 수익률: {fund.return_6m}%</p>
                            <p>12개월 누적 수익률: {fund.return_12m}%</p>
                            <p>펀드 등급: {fund.fund_grade}%</p>
                            <p>선취 수수료(%): {fund.fund_upfront_fee}%</p>
                            <p>위험 유형: {fund.fund_risk_type}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>추천할 펀드가 없습니다.</p>
            )}
        </div>
    );
};

export default FundRecommend;