import React, { useState, useEffect } from "react";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";

/**
 * DepositSavingsAutoSettings
 * 예적금 자동이체 등록 화면
 */
const DepositSavingsAutoSettings = () => {
  const customerId = getCustomerID();
  const [withdrawAccount, setWithdrawAccount] = useState(""); // 출금 계좌
  const [targetAccounts, setTargetAccounts] = useState([]); // 입금(예적금) 계좌 리스트
  const [selectedTargetAccount, setSelectedTargetAccount] = useState(""); // 선택한 입금 계좌
  const [transferAmount, setTransferAmount] = useState(""); // 이체 금액
  const [transferDay, setTransferDay] = useState(""); // 이체 일자

  useEffect(() => {
    if (!customerId) {
      alert("로그인이 필요합니다.");
      return;
    }
    fetchAccounts();
    fetchTargetAccounts();
  }, [customerId]);

  // 출금 계좌 조회
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

  // 예적금 계좌 조회
  const fetchTargetAccounts = async () => {
    try {
      const depositRes = await RefreshToken.get(`/deposit/accounts/customer/${customerId}`);
      const savingsRes = await RefreshToken.get(`/savings/accounts/customer/${customerId}`);
      const deposits = (depositRes.data || []).map(acc => ({
        accountNumber: acc.accountNumber,
        productName: acc.productName,
        type: "예금"
      }));
      const savings = (savingsRes.data || []).map(acc => ({
        accountNumber: acc.accountNumber,
        productName: acc.productName,
        type: "적금"
      }));
      setTargetAccounts([...deposits, ...savings]);
    } catch (error) {
      console.error("입금 계좌 조회 실패:", error);
      alert("입금 계좌를 불러오는데 실패했습니다.");
    }
  };

  // 자동이체 등록 처리
  const handleRegister = async () => {
    if (!selectedTargetAccount || !transferAmount || !transferDay) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const selectedAccount = targetAccounts.find(acc => acc.accountNumber === selectedTargetAccount);
    if (!selectedAccount) {
      alert("입금 계좌를 다시 선택해주세요.");
      return;
    }

    try {
      await RefreshToken.post(`/api/auto-transfer/register`, {
        withdrawAccountNumber: withdrawAccount,
        targetAccountNumber: selectedAccount.accountNumber,
        targetAccountType: selectedAccount.type === "예금" ? "DEPOSIT" : "SAVINGS",
        transferAmount: Number(transferAmount.replace(/,/g, "")),
        transferDay: Number(transferDay),
        transferStatus: "ACTIVE"
      });
      alert("자동이체가 등록되었습니다.");
      // 필요시 이동 처리
    } catch (error) {
      console.error("자동이체 등록 실패:", error);
      alert("자동이체 등록에 실패했습니다.");
    }
  };

  // 금액 입력 시 콤마 처리
  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value) {
      value = parseInt(value, 10).toLocaleString();
    }
    setTransferAmount(value);
  };

  return (
    <div>
      <h2>예적금 자동이체 등록</h2>

      <div>
        <strong>출금 계좌:</strong> {withdrawAccount}
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>입금할 예적금 계좌 선택:</label>
        <select value={selectedTargetAccount} onChange={(e) => setSelectedTargetAccount(e.target.value)}>
          <option value="">입금 계좌를 선택하세요</option>
          {targetAccounts.map((acc) => (
            <option key={acc.accountNumber} value={acc.accountNumber}>
              {acc.accountNumber} - {acc.productName} ({acc.type})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>이체 금액:</label>
        <input
          type="text"
          value={transferAmount}
          onChange={handleAmountChange}
          placeholder="금액 입력"
        />
      </div>

      <div style={{ marginTop: "10px" }}>
        <label>이체 일자 (1 ~ 28):</label>
        <input
          type="number"
          min="1"
          max="28"
          value={transferDay}
          onChange={(e) => setTransferDay(e.target.value)}
          placeholder="이체일 입력"
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleRegister}>자동이체 등록</button>
      </div>
    </div>
  );
};

export default DepositSavingsAutoSettings;
