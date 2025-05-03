import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/depositcss/DepositAccountInquiry.css";
import { Tag } from "antd";

const DepositAccountInquiry = () => {
  const [depositAccounts, setDepositAccounts] = useState([]);
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const customerId = getCustomerID();
  const navigate = useNavigate();

  useEffect(() => {
    if (!customerId) {
      const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
      if (goLogin) navigate("/login");
      else navigate("/");
      return;
    }

    RefreshToken.get("/deposit/accounts/deposit", {
      params: { customerId },
    })
      .then((res) => setDepositAccounts(res.data))
      .catch((err) => console.error("예금 계좌 조회 실패:", err));

    RefreshToken.get(`/deposit/accounts/savings/${customerId}`)
      .then((res) => setSavingsAccounts(res.data))
      .catch((err) => console.error("적금 계좌 조회 실패:", err));
  }, [customerId]);

  const renderAccountInfo = (account, type) => {
    return (
      <div className="accountCard" key={account.id}>
        <div>
          <div className="accountTitle">{account.productName}</div>
  
          <div className="accountInfo">
            <strong>계좌 번호</strong>
            <span>{account.accountNumber}</span>
          </div>
  
          {type === "DEPOSIT" && (
            <div className="accountInfo">
              <strong>별명</strong>
              <span>{account.nickname || "없음"}</span>
            </div>
          )}
  
          <div className="accountInfo">
            <strong>이자율</strong>
            <span>{account.interestRate ? `${account.interestRate}%` : "없음"}</span>
          </div>
  
          <div className="accountInfo">
            <strong>잔액</strong>
            <span className="balance">
              {account.balance?.toLocaleString() ?? "0"} 원
            </span>
          </div>
        </div>
  
        <div className="accountInfo">
          <strong>상태</strong>
          <span>
            <Tag color={account.accountStatus === "ACTIVE" ? "green" : "red"}>
              {account.accountStatus === "ACTIVE" ? "활성" : "비활성"}
            </Tag>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="depositDainquiry-container">
      <h3 className="depositDainquiry-title">예금 계좌 목록</h3>
      {depositAccounts.length === 0 ? (
        <div className="depositDainquiry-empty">현재 조회 가능한 예금 계좌가 없습니다.</div>
      ) : (
        <div className="depositDainquiry-row">
          {depositAccounts
            .filter((account) => account.accountStatus === "ACTIVE")
            .map((account) => (
              <div className="depositDainquiry-col" key={account.id}>
                {renderAccountInfo(account, "DEPOSIT")}
              </div>
            ))}
        </div>
      )}

      <hr className="depositDainquiry-divider" />

      <h3 className="depositDainquiry-title">적금 계좌 목록</h3>
      {savingsAccounts.length === 0 ? (
        <div className="depositDainquiry-empty">현재 조회 가능한 적금 계좌가 없습니다.</div>
      ) : (
        <div className="depositDainquiry-row">
          {savingsAccounts
            .filter((account) => account.accountStatus === "ACTIVE")
            .map((account) => (
              <div className="depositDainquiry-col" key={account.id}>
                {renderAccountInfo(account, "SAVINGS")}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default DepositAccountInquiry;
