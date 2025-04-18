import React, { useState, useEffect } from "react";
import "../Css/Deposit/DepositTermination.css"; // CSS 파일 import

const DepositTermination = () => {
  const [selectedAccount, setSelectedAccount] = useState(""); // 선택된 계좌
  const [terminationYear, setTerminationYear] = useState(""); // 해지 예상 연도
  const [terminationMonth, setTerminationMonth] = useState(""); // 해지 예상 월
  const [terminationDay, setTerminationDay] = useState(""); // 해지 예상 일
  const [accountList, setAccountList] = useState([]); // 보유 계좌 목록
  const [basicInfo, setBasicInfo] = useState({}); // 기본정보
  const [detailedInfo, setDetailedInfo] = useState({}); // 상세정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(""); // 에러 메시지

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i); // 현재 연도부터 10년
  const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1월부터 12월
  const days = Array.from({ length: 31 }, (_, i) => i + 1); // 1일부터 31일까지

  // 서버에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerId = localStorage.getItem("customerId"); // 로그인한 사용자 ID 가져오기
        if (!customerId) {
          console.error("Customer ID is null or undefined");
          setError("로그인 정보가 없습니다.");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8081/api/depositList?customerId=${customerId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAccountList(data); // 보유 계좌 목록 설정
          if (data.length > 0) {
            setSelectedAccount(data[0].dat_deposit_account_num); // 첫 번째 계좌를 기본 선택
            setBasicInfo(data[0]); // 첫 번째 계좌의 기본 정보 설정
            setDetailedInfo(data[0].detailedInfo || {}); // 상세정보 설정 (예: API에서 제공)
          }
        } else {
          setError("데이터를 가져오는 데 실패했습니다.");
          console.error("Failed to fetch data:", response.status);
        }
      } catch (error) {
        setError("네트워크 오류가 발생했습니다.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // 로딩 상태 해제
      }
    };

    fetchData();
  }, []);

  // 기본정보 변경 시 만기일을 해지 예상 일자에 반영
  useEffect(() => {
    if (basicInfo.dat_end_day) {
      const [year, month, day] = basicInfo.dat_end_day.split("-"); // 만기일을 "년-월-일"로 분리
      setTerminationYear(year); // 연도 설정
      setTerminationMonth(parseInt(month, 10)); // 월 설정 (문자열을 숫자로 변환)
      setTerminationDay(parseInt(day, 10)); // 일 설정 (문자열을 숫자로 변환)
    }
  }, [basicInfo]); // basicInfo가 변경될 때마다 실행

  const handleAccountChange = (accountNumber) => {
    setSelectedAccount(accountNumber);
    const selected = accountList.find((account) => account.dat_deposit_account_num === accountNumber);
    if (selected) {
      setBasicInfo(selected); // 선택된 계좌의 기본 정보 설정
      setDetailedInfo(selected.detailedInfo || {}); // 상세정보 설정
    }
  };

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="deposit-termination-container">
      <h1 className="deposit-termination-title">예금 해지 신청</h1>

      {/* NOTICE */}
      <div className="notice-section">
        <h2>NOTICE</h2>
        <p>
          찾으실 수 있는 금액 = 원금 + (이자합계 - 환입이자액) - (세금합계 - 기납액세액)
        </p>
      </div>

      {/* 보유 계좌 목록 */}
      <div className="form-group">
        <label>보유 계좌 목록:</label>
        <select
          value={selectedAccount}
          onChange={(e) => handleAccountChange(e.target.value)}
          className="form-control"
        >
          <option value="">계좌를 선택하세요</option>
          {accountList.map((account, index) => (
            <option key={index} value={account.dat_deposit_account_num}>
              {account.dat_deposit_account_num} (잔액: {account.dat_balance.toLocaleString()}원)
            </option>
          ))}
        </select>
      </div>

      {/* 기본정보 섹션 */}
      <div className="info-section">
        <h2>기본정보</h2>
        <table className="info-table">
          <tbody>
            <tr>
              <td>예금주명</td>
              <td>{basicInfo.dat_account_holder || "정보 없음"}</td>
            </tr>
            <tr>
              <td>계좌번호</td>
              <td>{basicInfo.dat_deposit_account_num || "정보 없음"}</td>
            </tr>
            <tr>
              <td>해지구분</td>
              <td>{basicInfo.terminationType || "정보 없음"}</td>
            </tr>
            <tr>
              <td>해지예정일</td>
              <td>{`${terminationYear}-${terminationMonth}-${terminationDay}` || "정보 없음"}</td>
            </tr>
            <tr>
              <td>상품종류</td>
              <td>{basicInfo.productType || "정보 없음"}</td>
            </tr>
            <tr>
              <td>신규일</td>
              <td>{basicInfo.dat_start_day || "정보 없음"}</td>
            </tr>
            <tr>
              <td>만기일</td>
              <td>{basicInfo.dat_end_day || "정보 없음"}</td>
            </tr>
            <tr>
              <td>총납입회차</td>
              <td>{basicInfo.totalPayments || "정보 없음"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 상세정보 섹션 */}
      <div className="info-section">
        <h2>상세정보</h2>
        <table className="info-table">
          <tbody>
            <tr>
              <td>원금</td>
              <td>{detailedInfo.principal || "정보 없음"}</td>
            </tr>
            <tr>
              <td>세금합계</td>
              <td>{detailedInfo.totalTax || "정보 없음"}</td>
            </tr>
            <tr>
              <td>세전이자액</td>
              <td>{detailedInfo.preTaxInterest || "정보 없음"}</td>
            </tr>
            <tr>
              <td>소득세/법인세</td>
              <td>{detailedInfo.incomeTax || "정보 없음"}</td>
            </tr>
            <tr>
              <td>세후이자액</td>
              <td>{detailedInfo.postTaxInterest || "정보 없음"}</td>
            </tr>
            <tr>
              <td>지방소득세</td>
              <td>{detailedInfo.localTax || "정보 없음"}</td>
            </tr>
            <tr>
              <td>만기(중도해지)이자</td>
              <td>{detailedInfo.maturityInterest || "정보 없음"}</td>
            </tr>
            <tr>
              <td>농특세</td>
              <td>{detailedInfo.agricultureTax || "정보 없음"}</td>
            </tr>
            <tr>
              <td>특별이자</td>
              <td>{detailedInfo.specialInterest || "정보 없음"}</td>
            </tr>
            <tr>
              <td>기지급이자액</td>
              <td>{detailedInfo.paidInterest || "정보 없음"}</td>
            </tr>
            <tr>
              <td>만기후이자</td>
              <td>{detailedInfo.postMaturityInterest || "정보 없음"}</td>
            </tr>
            <tr>
              <td>기납입세액</td>
              <td>{detailedInfo.paidTax || "정보 없음"}</td>
            </tr>
            <tr>
              <td>찾을 수 있는 금액</td>
              <td>{detailedInfo.withdrawableAmount || "정보 없음"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DepositTermination;