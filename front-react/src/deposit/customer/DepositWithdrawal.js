import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/depositcss/DepositWithdrawal.css";

const DepositWithdrawal = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("DEPOSIT");
  const customerId = getCustomerID();
  const [basicAccountNumber, setBasicAccountNumber] = useState(null);

  useEffect(() => {
    if (!customerId) {
      const goLogin = window.confirm(
        "로그인이 필요합니다. 로그인하시겠습니까?"
      );
      if (goLogin) navigate("/login");
      else navigate("/");
      return;
    }

    const fetch = async () => {
      const res = await RefreshToken.get(`/account/basic/${customerId}`);
      setBasicAccountNumber(res.data);
      fetchAccounts();
    };
    fetch();
  }, [navigate]);

  const fetchAccounts = async () => {
    try {
      const [depositRes, savingsRes] = await Promise.all([
        RefreshToken.get(`/deposit/accounts/customer/${customerId}`),
        RefreshToken.get(`/savings/accounts/customer/${customerId}`),
      ]);

      const all = [
        ...depositRes.data
          .filter((a) => a.accountStatus === "ACTIVE")
          .map((a) => ({ ...a, type: "DEPOSIT" })),
        ...savingsRes.data
          .filter((a) => a.accountStatus === "ACTIVE")
          .map((a) => ({ ...a, type: "SAVINGS" })),
      ];
      setAccounts(all);
    } catch (err) {
      alert("계좌 목록을 불러오지 못했습니다.");
    }
  };

  const formatAccountNumber = (n) => {
    return !n || n.length !== 13
      ? n
      : `${n.slice(0, 3)}-${n.slice(3, 9)}-${n.slice(9)}`;
  };

  const handleAccountChange = async (e) => {
    const [type, id] = e.target.value.split("-");
    const target = accounts.find(
      (a) => a.id === parseInt(id) && a.type === type
    );
    if (target) {
      setSelectedAccount(target);
      setAccountType(type);

      try {
        const url =
          type === "DEPOSIT"
            ? `/deposit/accounts/balance/${target.accountNumber}`
            : `/savings/accounts/balance/${target.accountNumber}`;
        const res = await RefreshToken.get(url);
        setAccountBalance(res.data);
      } catch {
        alert("잔액 조회 실패");
      }
    }
  };

  const handleTransaction = async (type) => {
    if (!selectedAccount) return alert("계좌를 선택하세요.");
    if (!amount || Number(amount) <= 0) return alert("금액을 입력하세요.");
    if (!password || password.length !== 4)
      return alert("비밀번호 4자리를 입력하세요.");

    const endpoint =
      accountType === "DEPOSIT"
        ? `/deposit/accounts/deposit/${selectedAccount.id}/${type}`
        : `/deposit/accounts/savings/${selectedAccount.id}/${type}`;

    try {
      await RefreshToken.post(endpoint, {
        transactionAmount: Number(amount),
        accountPassword: password,
        withdrawalAccountNumber: basicAccountNumber,
      });
      alert(`${type === "deposit" ? "입금" : "출금"} 완료되었습니다.`);
      setAmount("");
      setPassword("");
      fetchAccounts();
      navigate("/depositAccountInquiry");
    } catch {
      alert(`${type === "deposit" ? "입금" : "출금"}에 실패했습니다.`);
    }
  };

  return (
    <div className="depositDwith-container">
      <div className="depositDwith-card">
        <div className="depositDwith-title">예적금 입출금</div>

        <form
          className="depositDwith-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="depositDwith-group">
            <label>계좌 선택</label>
            <select onChange={handleAccountChange} required>
              <option value="">계좌 선택</option>
              {accounts.map((acc) => (
                <option
                  key={`${acc.type}-${acc.id}`}
                  value={`${acc.type}-${acc.id}`}
                >
                  [{acc.type === "DEPOSIT" ? "예금" : "적금"}]{" "}
                  {formatAccountNumber(acc.accountNumber)} - {acc.productName}
                </option>
              ))}
            </select>
          </div>

          {selectedAccount && (
            <>
              <div className="depositDwith-group">
                <label>현재 잔액</label>
                <input
                  type="text"
                  value={`${accountBalance.toLocaleString()}원`}
                  disabled
                />
              </div>

              <div className="depositDwith-group">
                <label>금액</label>
                <input
                  type="text"
                  value={amount
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, "");
                    if (!isNaN(raw)) setAmount(raw);
                  }}
                  required
                />
              </div>

              <div className="depositDwith-group">
                <label>계좌 비밀번호 (4자리)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={4}
                  required
                />
              </div>

              <div className="depositDwith-btn-group">
                <button
                  type="button"
                  className="depositDwith-btn"
                  onClick={() => handleTransaction("deposit")}
                >
                  입금하기
                </button>
                <button
                  type="button"
                  className="depositDwith-btn2"
                  onClick={() => handleTransaction("withdraw")}
                >
                  출금하기
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default DepositWithdrawal;
