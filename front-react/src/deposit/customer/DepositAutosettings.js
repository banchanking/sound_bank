import React, { useState, useEffect } from "react";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/depositcss/DepositAutosettings.css"; // 사뱅스타일 적용

const DepositSavingsAutoSettings = () => {
  const customerId = getCustomerID();
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [targetAccounts, setTargetAccounts] = useState([]);
  const [selectedTargetAccount, setSelectedTargetAccount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDay, setTransferDay] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("");

  useEffect(() => {
    if (!customerId) {
      alert("로그인이 필요합니다.");
      return;
    }
    fetchAccounts();
    fetchTargetAccounts();
  }, [customerId]);

  const fetchAccounts = async () => {
    try {
      const res = await RefreshToken.get(`/accounts/allAccount/${customerId}`);
      const accounts = res.data['입출금'] || [];
      if (accounts.length > 0) {
        setWithdrawAccount(accounts[0].account_number);
      }
    } catch (error) {
      console.error("출금 계좌 조회 실패:", error);
      alert("출금 계좌를 불러오는데 실패했습니다.");
    }
  };

  const fetchTargetAccounts = async () => {
    try {
      const depositRes = await RefreshToken.get(`/deposit/accounts/customer/${customerId}`);
      const savingsRes = await RefreshToken.get(`/savings/accounts/customer/${customerId}`);

      const allAccounts = [
        ...depositRes.data.filter(acc => acc.accountStatus === 'ACTIVE').map(acc => ({
          accountNumber: acc.accountNumber,
          productName: acc.productName,
          type: 'DEPOSIT'
        })),
        ...savingsRes.data.filter(acc => acc.accountStatus === 'ACTIVE').map(acc => ({
          accountNumber: acc.accountNumber,
          productName: acc.productName,
          type: 'SAVINGS'
        }))
      ];

      setTargetAccounts(allAccounts);
    } catch (error) {
      console.error("입금 계좌 조회 실패:", error);
      alert("입금 계좌를 불러오는데 실패했습니다.");
    }
  };

  const handleRegister = async () => {
    if (!selectedTargetAccount || !transferAmount || !transferDay || !accountPassword) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const selectedAccount = targetAccounts.find(acc => acc.accountNumber === selectedTargetAccount);
    if (!selectedAccount) {
      alert("입금 계좌를 다시 선택해주세요.");
      return;
    }

    try {
      await RefreshToken.post(`/auto-transfer/register`, {
        withdrawAccountNumber: withdrawAccount,
        targetAccountNumber: selectedAccount.accountNumber,
        targetAccountType: selectedAccount.type,
        transferAmount: Number(transferAmount.replace(/,/g, "")),
        transferDay: Number(transferDay),
        transferStatus: "ACTIVE",
        accountPassword: accountPassword
      });
      alert("자동이체가 등록되었습니다.");
    } catch (error) {
      console.error("자동이체 등록 실패:", error);
      alert("자동이체 등록에 실패했습니다.");
    }
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value) value = parseInt(value, 10).toLocaleString();
    setTransferAmount(value);
  };

  const handleAccountChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedTargetAccount(selectedValue);
    const selected = targetAccounts.find(acc => acc.accountNumber === selectedValue);
    if (selected) setSelectedAccountType(selected.type);
  };

  return (
    <div className="autoTransfer-container">
      <h2 className="autoTransfer-title">예적금 자동이체 등록</h2>
      <div className="autoTransfer-label"><strong>출금 계좌:</strong> {withdrawAccount}</div>
      <br />
      <div className="autoTransfer-field">
        <label className="autoTransfer-label2">입금할 예적금 계좌 선택</label>
        <select value={selectedTargetAccount} onChange={handleAccountChange} className="autoTransfer-select">
          <option value="">입금 계좌를 선택하세요</option>
          {targetAccounts.map((acc) => (
            <option key={acc.accountNumber} value={acc.accountNumber}>
              {acc.accountNumber} - {acc.productName} ({acc.type === 'DEPOSIT' ? '예금' : '적금'})
            </option>
          ))}
        </select>
      </div>

      {selectedAccountType && (
        <>
          <div className="autoTransfer-field">
            <label className="autoTransfer-label3">이체 금액</label>
            <input type="text" value={transferAmount} onChange={handleAmountChange} className="autoTransfer-input" placeholder="금액 입력" />
          </div>

          <div className="autoTransfer-field">
            <label className="autoTransfer-label3">이체 일자 (1~31일)</label>
            <input type="number" min="1" max="31" value={transferDay} onChange={(e) => setTransferDay(e.target.value)} className="autoTransfer-input" placeholder="이체일 입력" />
            {transferDay === "31" && (
              <div className="autoTransfer-hint">
                2월은 마지막 날인 28일에 출금됩니다.
              </div>
            )}
          </div>

          <div className="autoTransfer-field">
            <label className="autoTransfer-label3">계좌 비밀번호 (4자리)</label>
            <input type="password" value={accountPassword} maxLength={4} onChange={(e) => setAccountPassword(e.target.value)} className="autoTransfer-input" />
          </div>

          {selectedAccountType === 'SAVINGS' && (
            <div className="autoTransfer-notice">
              ※ 적금 상품은 월납입형입니다. 매월 설정된 금액이 자동 이체됩니다.
            </div>
          )}
        </>
      )}

      <div className="autoTransfer-submit">
        <button onClick={handleRegister} className="autoTransfer-btn">자동이체 등록</button>
      </div>
    </div>
  );
};

export default DepositSavingsAutoSettings;
