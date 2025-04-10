import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "../Css/Deposit/DepositJoin.css"; // CSS 파일 import
import DepositCalculator from "../Deposit/DepositCalculator"; // DepositCalculator 컴포넌트 import
import axios from "axios"; 

const DepositJoin = () => {
  const { name } = useParams(); // URL에서 상품 ID 가져오기
  const [selectedTerm, setSelectedTerm] = useState("3개월"); // 가입기간 상태 추가
  const [showCalculator, setShowCalculator] = useState(false); // DepositCalculator 표시 상태
  const [activeTab, setActiveTab] = useState("상품설명"); // 현재 활성화된 탭 상태
  const location = useLocation(); // location 객체 가져오기
  const { product, customerId: stateCustomerId, customerAccountNumber } = location.state || {};

  const customerId = stateCustomerId || localStorage.getItem("customerId"); // 로컬 스토리지에서 고객 ID 가져오기

  // 입력값 상태 추가
  const [accountNumber, setAccountNumber] = useState(customerAccountNumber || ""); // 계좌번호 상태
  const [accountPassword, setAccountPassword] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  

  useEffect(() => {

    if (!accountNumber) {
      // 서버에서 계좌번호 가져오기
      axios
        .get(`http://localhost:8081/api/accounts/allAccount/${customerId}`)
        .then((response) => {
          if (response.status === 200) {
            setAccountNumber(response.data.customer_account_number);
          } else {
            console.error("Failed to fetch account data:", response.statusText);
          }
        })
        .catch((error) => {
          console.error("Error fetching account data:", error);
        });
    }
  }, [customerId, accountNumber]);

  const handleTermChange = (event) => {
    setSelectedTerm(event.target.value); // 선택한 가입기간 업데이트
  };

  const handleToggleCalculator = () => {
    setShowCalculator((prev) => !prev); // showCalculator 상태를 토글
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab); // 활성화된 탭 변경
  };

  const calculateEndDate = (term) => {
  const startDate = new Date();
  let monthsToAdd = 0;

  if (term === "3개월") {
    monthsToAdd = 3;
  } else if (term === "6개월") {
    monthsToAdd = 6;
  } else if (term === "12개월") {
    monthsToAdd = 12;
  }

  startDate.setMonth(startDate.getMonth() + monthsToAdd);
  return startDate.toISOString().split("T")[0]; // YYYY-MM-DD 형식으로 반환
};

  const handleSubmit = async(e) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지

    // 입력값 검증
    if (!accountPassword.trim()) {
      alert("계좌비밀번호를 입력해주세요.");
      return;
    }
    if (!newAmount.trim()) {
      alert("신규금액을 입력해주세요.");
      return;
    }
    if (!newAccountPassword.trim()) {
      alert("신규계좌 비밀번호를 입력해주세요.");
      return;
    }
    if (newAccountPassword !== confirmPassword) {
      alert("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

  // 서버로 전송할 데이터 (테이블 구조에 맞춤)
  const depositData = {
    dat_account_num: accountNumber, // 출금계좌번호
    dat_account_pwd: accountPassword, // 출금계좌 비밀번호
    dat_deposit_account_pwd: newAccountPassword, // 예금계좌 비밀번호
    dat_new_amount: parseFloat(newAmount), // 신규금액
    dat_balance: parseFloat(newAmount), // 현재잔액 (신규금액과 동일)
    dat_term: selectedTerm, // 가입기간
    dat_start_day: new Date().toISOString().split("T")[0], // 개설일자 (오늘 날짜)
    dat_end_day: null, // 만기일은 서버에서 처리
  };

  try {
    const response = await axios.post("http://localhost:8081/api/depositInsert", depositData);
    if (response.status === 200) {
      alert("예금 가입이 완료되었습니다!");
    } else {
      alert("예금 가입에 실패했습니다.");
    }
  } catch (error) {
    console.error("Error inserting deposit:", error);
    alert("예금 가입 중 오류가 발생했습니다.");
  

  };

  };

  return (
    <div className="deposit-join-container">
      <h1 className="deposit-join-title">예금 신규 가입</h1>
      <p className="deposit-join-subtitle">선택한 상품: {name}</p>
      <form className="deposit-join-form" onSubmit={handleSubmit}>
        <table className="deposit-join-table">
          <tbody>
            <tr>
              <td className="label-cell">
                <label>출금계좌번호:</label>
              </td>
              <td className="input-cell">
                <input
                  type="text"
                  className="input-field"
                  value={accountNumber}
                  readOnly
                />
              </td>
            </tr>
            <tr>
              <td className="label-cell">
                <label>계좌비밀번호:</label>
              </td>
              <td className="input-cell">
                <input
                  type="password"
                  className="input-field"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>

        <table className="deposit-join-table">
          <tbody>
            <tr>
              <td className="label-cell">
                <label>신규금액:</label>
              </td>
              <td className="input-cell">
                <input
                  type="text"
                  className="input-field"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td className="label-cell">
                <label>가입기간:</label>
              </td>
              <td className="input-cell">
                <select
                  className="input-field"
                  value={selectedTerm}
                  onChange={handleTermChange}
                >
                  <option value="3개월">3개월</option>
                  <option value="6개월">6개월</option>
                  <option value="12개월">12개월</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="label-cell">
                <label>이자지급방법:</label>
              </td>
              <td className="input-cell">
                <label>만기일시지급식</label>
              </td>
            </tr>
            <tr>
              <td className="label-cell">
                <label>만기시해지방법:</label>
              </td>
              <td className="input-cell">
                <label>고객직접해지</label>
              </td>
            </tr>
            <tr>
              <td className="label-cell">
                <label>만기수취이자:</label>
              </td>
              <td className="input-cell">
                <button
                  type="button"
                  className="calculator-button"
                  onClick={handleToggleCalculator} // 버튼 클릭 시 DepositCalculator 표시/숨기기
                >
                  계산기
                </button>
              </td>
            </tr>

            <tr>
              <td className="label-cell">
                <label>신규계좌 비밀번호:</label>
              </td>
              <td className="input-cell">
                <input
                  type="password"
                  className="input-field"
                  value={newAccountPassword}
                  onChange={(e) => setNewAccountPassword(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td className="label-cell">
                <label>비밀번호 확인:</label>
              </td>
              <td className="input-cell">
                <input
                  type="password"
                  className="input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      {/* DepositCalculator 팝업 */}
      {showCalculator && (
        <div className="modal-overlay">
          <div className="modal-content">
            <DepositCalculator onClose={handleToggleCalculator} />
          </div>
        </div>
      )}

      {/* 탭 메뉴 */}
      <div className="tab-container">
        <button
          type="button"
          className={`tab-button ${activeTab === "상품설명" ? "active" : ""}`}
          onClick={() => handleTabChange("상품설명")}
        >
          상품설명
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "금리설명" ? "active" : ""}`}
          onClick={() => handleTabChange("금리설명")}
        >
          금리설명
        </button>
      </div>

      {/* 탭 내용 */}
      <div className="tab-content">
        {activeTab === "상품설명" && (
          <div>
            <h2>상품설명</h2>
            <p>
              이 상품은 안정적인 예금 서비스를 제공하며, 고객님의 자산을 안전하게 관리할 수 있도록 설계되었습니다.
              다양한 가입 기간과 금리 옵션을 통해 고객님의 재정 목표에 맞는 선택이 가능합니다.
            </p>
            <ul>
              <li>가입 기간: 3개월, 6개월, 12개월</li>
              <li>최소 가입 금액: 100,000원</li>
              <li>안정적인 원금 보장</li>
            </ul>
          </div>
        )}
        {activeTab === "금리설명" && (
          <div>
            <h2>금리설명</h2>
            <p>
              예금 금리는 가입 기간에 따라 차등 적용되며, 만기 시 원금과 함께 지급됩니다.
              아래는 가입 기간별 금리 예시입니다:
            </p>
            <table>
              <thead>
                <tr>
                  <th>가입 기간</th>
                  <th>금리</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>3개월</td>
                  <td>1.5%</td>
                </tr>
                <tr>
                  <td>6개월</td>
                  <td>1.8%</td>
                </tr>
                <tr>
                  <td>12개월</td>
                  <td>2.0%</td>
                </tr>
              </tbody>
            </table>
            <p>
              금리는 시장 상황에 따라 변동될 수 있으며, 자세한 내용은 은행 창구 또는 고객센터를 통해 확인하시기 바랍니다.
            </p>
          </div>
        )}
      </div>

      
        <button type="submit" className="submit-button">
          확인
        </button>
      </form>


    </div>
  );
};

export default DepositJoin;