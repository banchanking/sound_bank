import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import MyFund from "../customer/MyFund";  // 로그인 체크용 팝업 컴포넌트
import styles from "../../Css/fund/FundList.module.css"; // 스타일 파일 추가
import RefreshToken from "../../jwt/RefreshToken"; // RefreshToken 모듈 추가

const FundProductManage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [funds, setFunds] = useState([]);
  const [dropdownFunds, setDropdownFunds] = useState([]); // 드롭다운에 표시할 펀드 목록
  const [formData, setFormData] = useState({
    fund_id: "", // 소문자로 변경
    fund_name: "",
    fund_company: "",
    fund_type: "",
    fund_grade: "",
    fund_fee_rate: "",
    fund_upfront_fee: "",
    fund_risk_type: "",
    return_1m: 0,
    return_3m: 0,
    return_6m: 0,
    return_12m: 0,
  });

  // 로그인 체크 + 펀드 목록 조회
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }

    const fetchAll = async () => {
      try {
        const response1 = await RefreshToken.get("/fundList");
        setFunds(response1.data);
  
        const response2 = await RefreshToken.get("/registeredFunds");
        setDropdownFunds(response2.data);
      } catch (error) {
        console.error("펀드 목록 조회 중 오류 발생:", error);
      }
    };
  
    fetchAll();
  }, []);

  // 드롭다운에서 펀드 선택
  const handleDropdownChange = (e) => {
    const selected = dropdownFunds.find((fund) => fund.fund_name === e.target.value);
    if (selected) {
      setFormData({
        fund_id: Number(selected.fund_id), // 숫자로 변환
        fund_name: selected.fund_name,
        fund_company: selected.fund_company,
        fund_type: selected.fund_type,
        fund_grade: selected.fund_grade,
        fund_fee_rate: selected.fund_fee_rate,
        fund_upfront_fee: selected.fund_upfront_fee,  
        fund_risk_type: selected.fund_risk_type || "",
        return_1m: selected.return_1m,  
        return_3m: selected.return_3m,  
        return_6m: selected.return_6m,
        return_12m: selected.return_12m,
      });
    }
  };

  // 폼 데이터 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 펀드 수정
  const handleUpdateFund = async () => {
    try {
      const response = await RefreshToken.put(
        `/fundUpdate/${formData.fund_id}`,
        formData
      );
  
      console.log("펀드 수정 성공");
      alert("펀드가 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("Error updating fund:", error);
      alert("펀드 수정 중 오류가 발생했습니다.");
      }
    };

    // 펀드 삭제
    const handleDeleteFund = async (fund_id) => {
      try {
        const response = await RefreshToken.delete(
          `/fund/${fund_id}`
        );
    
        console.log("삭제 응답:", response.data);
        alert("펀드가 성공적으로 삭제되었습니다.");
    
      // 목록 새로 불러오기
      const updatedFundList = await RefreshToken.get("/fundList");
      setFunds(updatedFundList.data);

      const updatedDropdown = await RefreshToken.get("/registeredFunds");
      setDropdownFunds(updatedDropdown.data);

      // 폼 상태 초기화
      setFormData({
        fund_id: "",
        fund_name: "",
        fund_company: "",
        fund_type: "",
        fund_grade: "",
        fund_fee_rate: "",
        fund_upfront_fee: "",
        fund_risk_type: "",
        return_1m: 0,
        return_3m: 0,
        return_6m: 0,
        return_12m: 0,
      });

    } catch (error) {
      console.error("펀드 삭제 중 오류:", error);
      alert("펀드 삭제에 실패했습니다.");
    }
  };

  const handleConfirm = () => navigate("/login");
  const handleCancel = () => navigate("/");

  return (
    <>
    {showModal && (
      <MyFund
        message="로그인이 필요한 서비스입니다."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )}

    <div className={styles.fundContainer}>
      <h2>펀드 상품 관리</h2>

      {/* 펀드 수정/삭제 폼 */}
      <div className={styles.fundformcontainer}>
        <h3>펀드 수정/삭제</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateFund();
          }}
        >
          <div>
            <label>펀드 ID:</label>
            <input
              type="text"
              name="fund_id"
              value={formData.fund_id}
              readOnly // fund_id는 읽기 전용
            />
          </div>

          <div>
            <label>펀드 선택:</label>
            <select onChange={handleDropdownChange} defaultValue="">
              <option value="" disabled>
                펀드를 선택하세요
              </option>
              {dropdownFunds.map((fund, index) => (
                <option key={index} value={fund.fund_name}>
                  {fund.fund_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>펀드 이름:</label>
            <input
              type="text"
              name="fund_name"
              value={formData.fund_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>운용사명:</label>
            <input
              type="text"
              name="fund_company"
              value={formData.fund_company}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>펀드 유형:</label>
            <input
              type="text"
              name="fund_type"
              value={formData.fund_type}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>펀드 등급:</label>
            <input
              type="number"
              name="fund_grade"
              value={formData.fund_grade}
              onChange={handleChange}
              min="1"
              max="10"
            />
          </div>
          <div>
            <label>선취 수수료 (%):</label>
            <input
              type="number"
              name="fund_upfront_fee"
              value={formData.fund_upfront_fee}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div>
            <label>총보수 (%):</label>
            <input
              type="number"
              name="fund_fee_rate"
              value={formData.fund_fee_rate}
              onChange={handleChange}
              step="0.01"
            />
          </div>
          <div>
            <label>투자 성향:</label>
            <input
              type="text"
              name="fund_risk_type"
              value={formData.fund_risk_type}
              onChange={handleChange}
              readOnly // AI 모델 예측 결과로 읽기 전용
            />
          </div>
          <div>
            <label>1개월 수익률 (%):</label>
            <input
              type="number"
              name="return_1m"
              value={formData.return_1m}
              readOnly
            />
          </div>
          <div>
            <label>3개월 수익률 (%):</label>
            <input
              type="number"
              name="return_3m"
              value={formData.return_3m}
              readOnly
            />
          </div>
          <div>
            <label>6개월 수익률 (%):</label>
            <input
              type="number"
              name="return_6m"
              value={formData.return_6m}
              readOnly
            />
          </div>
          <div>
            <label>12개월 수익률 (%):</label>
            <input
              type="number"
              name="return_12m"
              value={formData.return_12m}
              readOnly
            />
          </div>
          <div className={styles.actionbuttons}>
          <button type="submit">수정</button>
          <button
            type="button"
            onClick={() => {
              if (!formData.fund_id) {
                alert("삭제할 펀드를 먼저 선택하세요.");
                return;
              }
              handleDeleteFund(formData.fund_id);
            }}
          >
            삭제
          </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default FundProductManage;