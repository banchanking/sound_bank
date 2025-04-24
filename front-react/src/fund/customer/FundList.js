import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "../../Css/fund/FundList.module.css";
import Fund from './Fund';  // 상세보기용 팝업 컴포넌트
import RefreshToken from "../../jwt/RefreshToken";
import FundCustomer from "../admin/FundCustomer";  // 로그인 체크용 팝업 컴포넌트

const FundList = () => {
  const navigate = useNavigate();
  const [funds, setFunds] = useState([]);
  const [expandedManagers, setExpandedManagers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedFundId, setSelectedFundId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 로그인 체크 + 펀드 불러오기
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }

    const fetchFunds = async () => {
      try {
        const response = await RefreshToken.get("/registeredFunds");
        setFunds(response.data);
      } catch (error) {
        console.error("Error fetching funds:", error);
      }
    };
    fetchFunds();
  }, []);

  const handleManagerClick = (manager) => {
    setExpandedManagers(prev =>
      prev.includes(manager) ? prev.filter(m => m !== manager) : [...prev, manager]
    );
  };

  const groupedFunds = funds.reduce((acc, fund) => {
    if (!acc[fund.fund_company]) acc[fund.fund_company] = {};
    if (!acc[fund.fund_company][fund.fund_type]) acc[fund.fund_company][fund.fund_type] = [];
    acc[fund.fund_company][fund.fund_type].push(fund);
    return acc;
  }, {});

  const handleOpenDetail = (fund_id) => {
    console.log("👉 상세보기 클릭 fundId:", fund_id);
    setSelectedFundId(fund_id);
    setShowDetail(true);
  };

  const handleFundBuy = async (fund) => {
    try {
      const customerId = localStorage.getItem("customerId");
      const fundAccountList = await RefreshToken.get(
        `/accounts/allAccount/fund/${customerId}`
      );
      console.log("🔍 펀드 계좌 조회 결과:", fundAccountList.data);
  
      const fundAccount = fundAccountList.data?.find(acc => acc.status === "APPROVED");
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
        fundAccountName: fund.fundAccountName,
        fundTransactionType: "BUY",
        fundInvestAmount: Number(fund.buyAmount),
        fundUnitsPurchased: fund.unitCount ? Number(fund.unitCount) : null
      };
      
      const res = await RefreshToken.post("/fundTrade", dto);
      alert(`💡${fund.fund_name} 💡\n 매수 신청이 완료되었습니다. 관리자 승인 후 계좌에 반영됩니다.`+ res.data);
      setShowDetail(false); // 팝업 닫기
    } catch (error) {
      console.error("매수 신청 실패", error);
      alert("매수 처리 중 오류 발생");
    }
  };

  const closeDetail = () => setShowDetail(false);

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
          <h1>펀드 상품 목록</h1>
        </div>
        {Object.keys(groupedFunds).map((manager, i) => (
          <div key={i}>
            <button className={styles.fundButton} onClick={() => handleManagerClick(manager)}>{manager}</button>
            {expandedManagers.includes(manager) && (
              <div className={styles.categorySelect}>
                <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
                  <option value="">유형 선택</option>
                  {Object.keys(groupedFunds[manager]).map((type, i) => (
                    <option key={i} value={type}>{type}</option>
                  ))}
                </select>
                {selectedCategory && (
                  <table className={styles.fundTable}>
                    <tbody>
                      {groupedFunds[manager][selectedCategory]?.map((fund) => (
                        <tr key={fund.fund_id}>
                          <td>{fund.fund_name}</td>
                          <td><button onClick={() => handleOpenDetail(fund.fund_id)}>상세보기</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}

        {showDetail && (
          <Fund
            fundId={selectedFundId}
            onClose={closeDetail}
            onBuy={(fund) => handleFundBuy(fund)} // fund 안에 buyAmount, unitCount 같이 옴
          /> 
        )}
      </div>
      </>
    );
  };

export default FundList;
