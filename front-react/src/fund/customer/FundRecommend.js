import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../../Css/fund/FundList.module.css"; // 스타일 파일 추가
import RefreshToken from "../../jwt/RefreshToken"; // 인증 포함된 인스턴스 사용
import Fund from './Fund';  // 상세보기용 팝업 컴포넌트
import FundCustomer from "../admin/FundCustomer";  // 로그인 체크용 팝업 컴포넌트

const FundRecommend = () => {
    const navigate = useNavigate();
    const [recommendedFunds, setRecommendedFunds] = useState([]);
    const [selectedFund, setSelectedFund] = useState(null); // 선택된 펀드
    const [showDetail, setShowDetail] = useState(false);    // 상세보기 팝업 여부
    const [showModal, setShowModal] = useState(false);

    // 투자 성향 기반 추천 펀드 불러오기
    useEffect(() => {
        // 로그인 체크
        const token = localStorage.getItem("auth_token");
        if (!token) {
        setShowModal(true);
        return;
        }

        // 추천 펀드 목록 불러오기
        const fetchRecommendedFunds = async () => {
            const customerId = localStorage.getItem("customerId");
            if (!customerId) {
            alert("로그인이 필요합니다.");
            return;
            }

            try {
                const response = await RefreshToken.get(`/fundRecommend/${customerId}`);
                setRecommendedFunds(response.data); // 추천 펀드 목록 설정
            } catch (error) {
                console.error("펀드 추천 목록을 가져오는 중 오류 발생:", error);
            }
        };

        fetchRecommendedFunds();
    }, []);

    // 팝업에서 매수 완료 시 처리
    const handleBuy = async (fund) => {
        
        try {
          const customerId = localStorage.getItem("customerId");
      
          const fundAccountList = await RefreshToken.get(`/accounts/allAccount/fund/${customerId}`);
          const fundAccount = fundAccountList.data?.find(acc => acc.status === "APPROVED" && acc.linkedAccountNumber);
          const fundAccountId = fundAccount?.fundAccountId;
          const withdrawAccountNumber = fundAccount?.linkedAccountNumber;
      
          if (!fundAccount || !fundAccount.fundAccountId || !fundAccount.linkedAccountNumber) {
            alert("사용 가능한 펀드 계좌가 없습니다. 관리자 승인 여부를 확인해주세요.");
            return;
          }
      
          const dto = {
            customerId,
            fundId: fund.fund_id,
            fundAccountId,
            withdrawAccountNumber,
            fundTransactionType: "BUY",
            fundInvestAmount: Number(fund.buyAmount),
            fundUnitsPurchased: fund.unitCount ? Number(fund.unitCount) : null,
          };
          
          console.log("매수 처리:", dto); // 선택한 펀드 정보 확인
          await RefreshToken.post("/fundTrade", dto);
          
          alert(`💡${fund.fund_name} 💡\n 매수 신청이 완료되었습니다. 관리자 승인 후 계좌에 반영됩니다.`);
          setShowDetail(false); // 팝업 닫기
        } catch (error) {
          console.error("매수 실패", error);
          alert("매수 중 오류 발생");
        }
      };
  // 모달 핸들러
  const handleConfirm = () => navigate("/login");
  const handleCancel = () => navigate("/");


    return (
        <>
        {showModal && (
            <FundCustomer
            message="로그인이 필요한 서비스입니다."
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            />
        )}

        <div className={styles.fundContainer}>
        <div className={styles.fundtesttitle}>
            <h1> 투자성향 기반 추천 펀드</h1>
            {recommendedFunds.length> 0 ? (
                <table className={styles.fundTable}>
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
                            <th>선택</th>
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
                                <td>
                                    <button
                                    onClick={() => {
                                        setSelectedFund(fund);  // 선택한 펀드 설정
                                        setShowDetail(true);    // Fund.js 팝업 열기
                                    }}
                                    className={styles.fundBuyButton}
                                    >
                                    매수하기
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>추천할 펀드가 없습니다.</p>
            )}
        </div>

        {/* 상세보기 팝업 (Fund.js) */}
        {showDetail && selectedFund && (
            <Fund
            fundId={selectedFund.fund_id}
            fund={selectedFund}
            onClose={() => setShowDetail(false)}
            onBuy={(selectedFund) => handleBuy(selectedFund)} // 매수 처리 함수
            />
        )}
        </div>
        </>
    );
};

export default FundRecommend;