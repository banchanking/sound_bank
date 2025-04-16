import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAccount.module.css";

const OpenAccount = () => {
  const customer_id = localStorage.getItem("customerId");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await RefreshToken.get(
          `http://localhost:8081/api/accounts/allAccount/${customer_id}`
        );
        console.log("✅ 응답 확인:", res.data);
        const allAccounts = Object.values(res.data).flat(); // 입출금 + 예금 합침
        setAccounts(allAccounts);
      } catch (err) {
        console.error("❌ 계좌 불러오기 실패:", err);
      }
    };

    fetchAccounts();
  }, [customer_id]);

  const handleSubmit = async () => {
    const payload = {
      customer_id: customer_id,
      fund_account_password: password,
      linked_account_number: selectedAccount,
      fund_account_name: accountName,
    };

    try {
      await RefreshToken.post("http://localhost:8081/api/fund/open", payload);
      alert("펀드 계좌 개설 신청이 완료되었습니다.");
      setSelectedAccount("");
      setPassword("");
      setAccountName("");
    } catch (error) {
      console.error("계좌 개설 실패", error);
      alert("계좌 개설 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.fundAccountcontainer}>
      <h2 className={styles.fundAccounttitle}>펀드 계좌 개설</h2>
      <div className={styles.fundAccountform}>
        <label>📄 보유 계좌 선택</label>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          <option value="">계좌를 선택하세요</option>
          {Array.isArray(accounts) && accounts.length > 0 ? (
            accounts.map((acc) => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountNumber} ({acc.account_type})
              </option>
            ))
          ) : (
            <option disabled>계좌가 없습니다</option>
          )}
        </select>

        <label>🔒 펀드 계좌 비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="4자리 숫자"
        />

        <label>📝 펀드 계좌 이름</label>
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="예: 미래를 위한 투자통장"
        />

        <button className={styles.fundAccountbutton} onClick={handleSubmit}>
          개설 신청
        </button>
      </div>
    </div>
  );
};

export default OpenAccount;
