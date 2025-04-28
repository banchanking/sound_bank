import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import '../../Css/depositcss/DepositAccountInquiry.css';
import { Card } from 'antd';

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
        .then(res => {
          console.log('예금 계좌 조회 결과:', res.data); // 🔥 여기 찍어야 한다
          setDepositAccounts(res.data)})
        .catch(err => console.error('예금 계좌 조회 실패:', err));
  
      // 적금 계좌 가져오기
      RefreshToken.get(`/deposit/accounts/savings/${customerId}`)
        .then(res => 
          setSavingsAccounts(res.data))
        .catch(err => console.error('적금 계좌 조회 실패:', err));
    }, [customerId]);
  
    return (
      <div className="depositContainer">
        <h2>예금 계좌 목록</h2>
        {depositAccounts.length === 0 ? (
          <div>현재 조회 가능한 계좌가 없습니다.</div>
        ) : (
          <div className="accountCardContainer">
            {depositAccounts
              .filter(account => account.accountStatus === 'ACTIVE')
              .map(account => (
                <Card key={account.id} className="accountCard">
                  <div className="accountNumber">{account.accountNumber}</div>
                  <div className="productName">{account.productName}</div>
                  <div className="accountBalance">{account.balance.toLocaleString()}원</div>
                </Card>
              ))}
          </div>
        )}
    
        <h2>적금 계좌 목록</h2>
        {savingsAccounts.length === 0 ? (
          <div>현재 조회 가능한 계좌가 없습니다.</div>
        ) : (
          <div className="accountCardContainer">
            {savingsAccounts
              .filter(account => account.accountStatus === 'ACTIVE')
              .map(account => (
                <Card key={account.id} className="accountCard">
                  <div className="accountNumber">{account.accountNumber}</div>
                  <div className="productName">{account.productName}</div>
                  <div className="accountBalance">{account.balance.toLocaleString()}원</div>
                </Card>
              ))}
          </div>
        )}
      </div>
    );
    
    
    
    

  };
  
  export default DepositAccountInquiry;