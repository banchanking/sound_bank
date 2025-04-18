import React, { useEffect, useState } from 'react';
import styles from "../../Css/fund/FundList.module.css";
import Fund from './Fund';
import RefreshToken from "../../jwt/RefreshToken";

const FundList = () => {
  const [funds, setFunds] = useState([]);
  const [expandedManagers, setExpandedManagers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [selectedFundId, setSelectedFundId] = useState(null);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const response = await RefreshToken.get("http://localhost:8081/api/registeredFunds");
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
        `http://localhost:8081/api/accounts/allAccount/fund/${customerId}`
      );
  
      const fundAccount = fundAccountList.data?.[0];
      const fundAccountId = fundAccount?.fundAccountId;
      const withdrawAccountNumber = fundAccount?.linkedAccountNumber;
  
      if (!fundAccountId || !withdrawAccountNumber) {
        alert("펀드 계좌 정보가 올바르지 않습니다.");
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
        fundUnitsPurchased: fund.unitCount ? Number(fund.unitCount) : null,
      };
  
      const res = await RefreshToken.post("http://localhost:8081/api/fundTrade/buy", dto);
      alert("매수 신청 완료: " + res.data);
    } catch (error) {
      console.error("매수 신청 실패", error);
      alert("매수 처리 중 오류 발생");
    }
  };

  const closeDetail = () => setShowDetail(false);

  return (
    <div className={styles.fundContainer}>
      {Object.keys(groupedFunds).map((manager, i) => (
        <div key={i}>
          <button onClick={() => handleManagerClick(manager)}>{manager}</button>
          {expandedManagers.includes(manager) && (
            <div>
              <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
                <option value="">유형 선택</option>
                {Object.keys(groupedFunds[manager]).map((type, i) => (
                  <option key={i} value={type}>{type}</option>
                ))}
              </select>
              {selectedCategory && (
                <table>
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
        <>
          <Fund
            fundId={selectedFundId}
            onClose={closeDetail}
            onBuy={(fund) => handleFundBuy(fund)} // fund 안에 buyAmount, unitCount 같이 옴
          /> 
        </>
      )}
    </div>
  );
};

export default FundList;
