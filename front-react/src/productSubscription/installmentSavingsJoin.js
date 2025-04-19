import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "../Css/Deposit/DepositJoin.css";
import axios from "axios"; 

const InstallmentSavingsJoin = () => {
  const { name } = useParams();
  const location = useLocation();
  const { product, customerId: stateCustomerId } = location.state || {};
  const customerId = stateCustomerId || localStorage.getItem("customerId");
  const navigate = useNavigate();

  // 상태 변수
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [accountNumber, setAccountNumber] = useState(product?.customer_account_number || "");
  const [accountPassword, setAccountPassword] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("12개월");
  const [activeTab, setActiveTab] = useState("상품설명");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 적금 상품 목록 정의
  const savingsProducts = [
    {
      name: "SOUND 청년희망적금",
      minAmount: 10000,
      maxAmount: 1000000,
      interestRate: 4.0,
      maxInterestRate: 4.5,
      monthlyDeposit: 100000,
      description: "만 19세~34세 청년을 위한 특별 적금 상품",
      targetAge: "19~34세",
      features: ["청년우대금리", "월 10만원 이상 납입", "만기일시지급식"]
    },
    {
      name: "SOUND 노후준비적금",
      minAmount: 50000,
      maxAmount: 500000,
      interestRate: 3.7,
      maxInterestRate: 4.0,
      monthlyDeposit: 50000,
      description: "안정적인 노후를 준비하시는 분들을 위한 적금",
      targetAge: "50세 이상",
      features: ["노후우대금리", "월 5만원 이상 납입", "만기일시지급식"]
    },
    {
      name: "SOUND 자유적금",
      minAmount: 10000,
      maxAmount: 300000,
      interestRate: 3.0,
      maxInterestRate: 3.2,
      monthlyDeposit: 10000,
      description: "자유로운 입출금이 가능한 적금 상품",
      targetAge: "전체",
      features: ["자유우대금리", "월 1만원 이상 납입", "자유입출금"]
    },
    {
      name: "SOUND 꿈나무적금",
      minAmount: 10000,
      maxAmount: 200000,
      interestRate: 3.5,
      maxInterestRate: 3.8,
      monthlyDeposit: 10000,
      description: "자녀의 미래를 위한 교육적금",
      targetAge: "만 18세 미만",
      features: ["교육우대금리", "월 1만원 이상 납입", "만기일시지급식"]
    },
    {
      name: "SOUND 주거안정적금",
      minAmount: 100000,
      maxAmount: 1000000,
      interestRate: 3.8,
      maxInterestRate: 4.2,
      monthlyDeposit: 100000,
      description: "주거안정을 위한 특별 적금",
      targetAge: "전체",
      features: ["주거우대금리", "월 10만원 이상 납입", "만기일시지급식"]
    }
  ];

  useEffect(() => {
    // 고객 ID가 없으면 로그인 페이지로 이동
    if (!customerId) {
      navigate('/login');
      return;
    }

    // 계좌 정보 가져오기
    fetch(`http://localhost:8081/api/accounts/allAccount/${customerId}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          setAccountNumber(data[0].customer_account_number);
        }
      })
      .catch(error => {
        console.error('계좌 정보를 가져오는 중 오류 발생:', error);
        setError('계좌 정보를 가져오는 중 오류가 발생했습니다.');
      });

    // 선택된 상품 정보 설정
    if (product) {
      // state로 전달된 상품 정보가 있으면 그 정보를 사용
      setSelectedProduct(product);
    } else {
      // URL 파라미터로 전달된 상품 이름으로 상품 찾기
      const productName = decodeURIComponent(name);
      console.log("선택된 상품 이름:", productName); // 디버깅용 로그
      
      const foundProduct = savingsProducts.find(p => p.name === productName);
      console.log("찾은 상품:", foundProduct); // 디버깅용 로그
      
      if (foundProduct) {
        setSelectedProduct(foundProduct);
      } else {
        setError('선택한 상품을 찾을 수 없습니다.');
        setTimeout(() => {
          navigate('/installmentSavings');
        }, 2000);
      }
    }
  }, [customerId, name, navigate, product]);

  const handleTermChange = (event) => {
    setSelectedTerm(event.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const calculateEndDate = (term) => {
    const startDate = new Date();
    let monthsToAdd = 0;

    if (term === "12개월") {
      monthsToAdd = 12;
    } else if (term === "24개월") {
      monthsToAdd = 24;
    } else if (term === "36개월") {
      monthsToAdd = 36;
    }

    startDate.setMonth(startDate.getMonth() + monthsToAdd);
    
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, "0");
    const day = String(startDate.getDate()).padStart(2, "0");
  
    return `${year}/${month}/${day}`;
  };

  const generateAccountNumber = () => {
    const prefix = 'S';
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
    return `${prefix}${randomNum}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!accountNumber || !newAmount) {
      setError('계좌와 금액을 모두 입력해주세요.');
      return;
    }

    if (newAccountPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const amountNum = parseInt(newAmount.replace(/,/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('유효한 금액을 입력해주세요.');
      return;
    }

    if (amountNum < selectedProduct.minAmount) {
      setError(`최소 금액은 ${selectedProduct.minAmount.toLocaleString()}원입니다.`);
      return;
    }

    if (amountNum > selectedProduct.maxAmount) {
      setError(`최대 금액은 ${selectedProduct.maxAmount.toLocaleString()}원입니다.`);
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/api/savings/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dat_account_num: accountNumber,
          dat_deposit_account_num: generateAccountNumber(),
          dat_balance: amountNum,
          dat_transaction_type: 'SAVINGS',
          dat_term: selectedTerm,
          dat_start_day: new Date().toISOString().split('T')[0],
          dat_end_day: calculateEndDate(selectedTerm),
          dat_interest_rate: selectedProduct.interestRate,
          dat_max_interest_rate: selectedProduct.maxInterestRate,
          dat_min_amount: selectedProduct.minAmount,
          dat_max_amount: selectedProduct.maxAmount,
          dat_monthly_deposit: selectedProduct.monthlyDeposit,
          dat_description: selectedProduct.description,
          dat_target_age: selectedProduct.targetAge,
          dat_features: selectedProduct.features,
          dat_password: newAccountPassword
        })
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess('적금 계좌가 개설되었습니다.');
        setTimeout(() => {
          navigate('/depositInquire');
        }, 2000);
      } else {
        setError(result.message || '적금 계좌 개설 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('적금 계좌 개설 중 오류 발생:', error);
      setError('서버와의 통신 중 오류가 발생했습니다.');
    }
  };

  // 상품 상세 정보
  const productDetails = {
    "SOUND 청년희망적금": {
      상품설명: "만 19세~34세 청년을 위한 특별 적금 상품",
      이자지급방법: "만기일시지급식 (만기일에 원금과 이자를 함께 지급)",
      만기시해지방법: "만기일 도래 시 자동해지되며, 원금과 이자가 출금계좌로 자동 이체됩니다.",
      금리설명: "기본금리 4.0% 적용 (세전), 청년우대금리 최대 4.5%"
    },
    "SOUND 노후준비적금": {
      상품설명: "안정적인 노후를 준비하시는 분들을 위한 적금",
      이자지급방법: "만기일시지급식 (만기일에 원금과 이자를 함께 지급)",
      만기시해지방법: "만기일 도래 시 자동해지되며, 원금과 이자가 출금계좌로 자동 이체됩니다.",
      금리설명: "기본금리 3.7% 적용 (세전), 노후우대금리 최대 4.0%"
    },
    "SOUND 자유적금": {
      상품설명: "자유로운 입출금이 가능한 적금 상품",
      이자지급방법: "만기일시지급식 (만기일에 원금과 이자를 함께 지급)",
      만기시해지방법: "만기일 도래 시 자동해지되며, 원금과 이자가 출금계좌로 자동 이체됩니다.",
      금리설명: "기본금리 3.0% 적용 (세전), 우대금리 최대 3.2%"
    },
    "SOUND 꿈나무적금": {
      상품설명: "자녀의 미래를 위한 교육적금",
      이자지급방법: "만기일시지급식 (만기일에 원금과 이자를 함께 지급)",
      만기시해지방법: "만기일 도래 시 자동해지되며, 원금과 이자가 출금계좌로 자동 이체됩니다.",
      금리설명: "기본금리 3.5% 적용 (세전), 교육우대금리 최대 3.8%"
    },
    "SOUND 주거안정적금": {
      상품설명: "주거안정을 위한 특별 적금",
      이자지급방법: "만기일시지급식 (만기일에 원금과 이자를 함께 지급)",
      만기시해지방법: "만기일 도래 시 자동해지되며, 원금과 이자가 출금계좌로 자동 이체됩니다.",
      금리설명: "기본금리 3.8% 적용 (세전), 주거우대금리 최대 4.2%"
    }
  };

  return (
    <div className="deposit-join-container">
      <h1 className="deposit-join-title">적금 신규 가입</h1>
      <p className="deposit-join-subtitle">선택한 상품: {selectedProduct?.name || decodeURIComponent(name)}</p>

      {/* 상품 상세 정보 탭 */}
      <div className="product-details-tabs">
        <div className="tab-buttons">
          <button
            className={activeTab === "상품설명" ? "active" : ""}
            onClick={() => handleTabChange("상품설명")}
          >
            상품설명
          </button>
          <button
            className={activeTab === "이자지급방법" ? "active" : ""}
            onClick={() => handleTabChange("이자지급방법")}
          >
            이자지급방법
          </button>
          <button
            className={activeTab === "만기시해지방법" ? "active" : ""}
            onClick={() => handleTabChange("만기시해지방법")}
          >
            만기시해지방법
          </button>
          <button
            className={activeTab === "금리설명" ? "active" : ""}
            onClick={() => handleTabChange("금리설명")}
          >
            금리설명
          </button>
        </div>
        <div className="tab-content">
          {selectedProduct && productDetails[selectedProduct.name] && productDetails[selectedProduct.name][activeTab]}
        </div>
      </div>

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
                  <option value="12개월">12개월</option>
                  <option value="24개월">24개월</option>
                  <option value="36개월">36개월</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="label-cell">
                <label>월 납입금:</label>
              </td>
              <td className="input-cell">
                <input
                  type="text"
                  className="input-field"
                  value={selectedProduct?.monthlyDeposit.toLocaleString() + '원'}
                  readOnly
                />
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

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="submit-button">
          확인
        </button>
      </form>
    </div>
  );
};

export default InstallmentSavingsJoin; 