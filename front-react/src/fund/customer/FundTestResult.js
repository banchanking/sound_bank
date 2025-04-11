import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/fund/Fund.css"; // 스타일 파일 추가

const FundTestResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    const investmentTypes = ["안정형", "보수형", "위험중립형", "적극형", "공격형"];
    const investmentType = investmentTypes[result] || "알 수 없음";

    // 로그인된 회원 ID 가져오기 (예: 로컬 스토리지 또는 상태 관리에서 가져옴)
    const customerId = localStorage.getItem("customer_id");

    // 투자 성향을 서버로 전송하여 업데이트
    useEffect(() => {
        const updateRiskType = async () => {
            try {
                const payload = {
                    customer_id: customerId,
                    fund_risk_type: investmentType,
                };
                await axios.post("http://localhost:8081/api/test-result/save", payload, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                console.log("투자 성향 등록 및 업데이트 성공");
            } catch (error) {
                console.error("투자 성향 등록 및 업데이트 중 오류 발생:", error);
            }
        };

        // customerId가 존재하면 항상 업데이트 실행
        if (customerId) {
            updateRiskType();
        }
    }, [customerId, investmentType]);


    return (
        <div className="fund-test-result-container">
            <h1 className="fund-test-result-title">투자성향 분석 결과</h1>
            <table className="fund-test-result-table">
                <tbody>
                    <tr>
                        고객님의 투자성향은
                        <strong> {investmentType}</strong>입니다.
                    </tr>
                </tbody>
            </table>
            <div className="fund-test-result-buttons">
                <button
                    className="fund-test-result-button"
                    onClick={() => navigate("/fundRecommend", { state: { result } })}
                >
                    나에게 맞는 <br>
                    </br>펀드 추천받기
                </button>
            </div>
        </div>
    );
};

export default FundTestResult;