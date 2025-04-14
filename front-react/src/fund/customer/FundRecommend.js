import React, { useEffect, useState } from "react";
import styles from "../../Css/fund/FundList.module.css"; // 스타일 파일 추가
import RefreshToken from "../../jwt/RefreshToken"; // 인증 포함된 인스턴스 사용

const FundRecommend = () => {
    const [recommendedFunds, setRecommendedFunds] = useState([]);
    const customerId = localStorage.getItem("customerId"); // 로그인된 사용자 ID 가져오기

    useEffect(() => {
        const fetchRecommendedFunds = async () => {
            const customerId = localStorage.getItem("customerId");
            if (!customerId) {
            alert("로그인이 필요합니다.");
            return;
            }

            try {
                const response = await RefreshToken.get(`http://localhost:8081/api/fundRecommend/${customerId}`);
                setRecommendedFunds(response.data); // 추천 펀드 목록 설정
            } catch (error) {
                console.error("펀드 추천 목록을 가져오는 중 오류 발생:", error);
            }
        };

        fetchRecommendedFunds();
    }, []);

    return (
        <div className={styles.fundrecommendcontainer}>
            <h1> 투자성향 기반 추천 펀드</h1>
            {recommendedFunds.length> 0 ? (
                <table className={styles.fundtable}>
                    <thead>
                        <tr>
                            <th>펀드명</th>
                            <th>1M 수익률</th>
                            <th>3M 수익률</th>
                            <th>6M 수익률</th>
                            <th>12M 수익률</th>
                            <th>등급</th>
                            <th>선취수수료</th>
                            <th>성향</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recommendedFunds.map((fund) => (
                            <tr key={fund.fund_id}>
                                <td>{fund.fund_name}</td>
                                <td>{fund.return_1m}%</td>
                                <td>{fund.return_3m}%</td>
                                <td>{fund.return_6m}%</td>
                                <td>{fund.return_12m}%</td>
                                <td>{fund.fund_grade}</td>
                                <td>{fund.fund_upfront_fee}%</td>
                                <td>{fund.fund_risk_type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>추천할 펀드가 없습니다.</p>
            )}
        </div>
    );
};

export default FundRecommend;