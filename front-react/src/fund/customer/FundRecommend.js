import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../Css/fund/FundList.module.css"; // 스타일 파일 추가
import style from "../../Css/exchange/ExList.module.css"; // 페이지네이션 스타일 파일
import RefreshToken from "../../jwt/RefreshToken"; // 인증 포함된 인스턴스 사용
import Fund from "./Fund"; // 상세보기용 팝업 컴포넌트
import FundCustomer from "../admin/FundCustomer"; // 로그인 체크용 팝업 컴포넌트

const FundRecommend = () => {
  const navigate = useNavigate();
  const [recommendedFunds, setRecommendedFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null); // 선택된 펀드
  const [showDetail, setShowDetail] = useState(false); // 상세보기 팝업 여부
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState(""); // 검색어 상태
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태
  const itemsPerPage = 10; // 페이지당 표시할 항목 수

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
      const fundAccount = fundAccountList.data?.find(
        (acc) => acc.status === "APPROVED" && acc.linkedAccountNumber
      );
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

  // 검색 필터링
  const filteredFunds = recommendedFunds.filter(
    (fund) =>
      fund.fund_name.toLowerCase().includes(search.toLowerCase()) || // 펀드명 검색
      fund.fund_risk_type.toLowerCase().includes(search.toLowerCase()) // 성향 검색
  );

  // 현재 페이지에 표시할 데이터 계산
  const indexOfLastItem = currentPage * itemsPerPage; // 현재 페이지의 마지막 항목 인덱스
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // 현재 페이지의 첫 번째 항목 인덱스
  const currentFunds = filteredFunds.slice(indexOfFirstItem, indexOfLastItem); // 현재 페이지에 표시할 데이터

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
          <h1 className={styles.fundTitle}> 투자성향 기반 추천 펀드</h1>
      <div></div>
          {/* 검색 입력창 */}
          <input
            type="text"
            className={styles.searchInput}
            placeholder="펀드명 또는 성향 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)} // 검색어 업데이트
          />

          {currentFunds.length > 0 ? (
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
                {currentFunds.map((fund) => (
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
                          setSelectedFund(fund); // 선택한 펀드 설정
                          setShowDetail(true); // Fund.js 팝업 열기
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

          {/* 페이지네이션 */}
          <div
            className={style.pagination}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              className={style.exListBtn}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} // 이전 페이지로 이동
              disabled={currentPage === 1}
            >
              ◀ 이전
            </button>
            <span>
              {currentPage} / {Math.ceil(filteredFunds.length / itemsPerPage)}
            </span>{" "}
            {/* 현재 페이지 / 총 페이지 */}
            <button
              className={style.exListBtn}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(filteredFunds.length / itemsPerPage))
                )
              } // 다음 페이지로 이동
              disabled={currentPage === Math.ceil(filteredFunds.length / itemsPerPage)}
            >
              다음 ▶
            </button>
          </div>
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

    </>
  );
};

export default FundRecommend;