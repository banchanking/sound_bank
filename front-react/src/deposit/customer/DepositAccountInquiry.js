import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositAccountInquiry.css';

const DepositAccountInquiry = () => {
    const [depositAccounts, setDepositAccounts] = useState([]);
    const [savingsAccounts, setSavingsAccounts] = useState([]);
    const customerId = getCustomerID();

    const navigate = useNavigate();
    useEffect(() => {
  
      const customer_id = getCustomerID();
      if (!customer_id) {
        if (!customer_id) {
          const goLogin = window.confirm(
            "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
          );
          if (goLogin) {
            navigate("/login");
          } else {
            navigate("/");
          }
          return;      
      }
    }
  
  
      // 예금 계좌 가져오기
      RefreshToken.get(`/deposit/accounts/deposit/${customerId}`)
        .then(res => setDepositAccounts(res.data))
        .catch(err => console.error('예금 계좌 조회 실패:', err));
  
      // 적금 계좌 가져오기
      RefreshToken.get(`/deposit/accounts/savings/${customerId}`)
        .then(res => setSavingsAccounts(res.data))
        .catch(err => console.error('적금 계좌 조회 실패:', err));
    }, [customerId]);
  
    return (
      <div>
        <h2>예금 계좌 목록</h2>
        <ul>
          {depositAccounts.map(account => (
            <li key={account.id}>
              {account.accountNumber} - {account.balance.toLocaleString()}원
            </li>
          ))}
        </ul>
  
        <h2>적금 계좌 목록</h2>
        <ul>
          {savingsAccounts.map(account => (
            <li key={account.id}>
              {account.accountNumber} - {account.balance.toLocaleString()}원
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default DepositAccountInquiry;