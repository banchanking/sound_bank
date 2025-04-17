import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAccount.module.css";

const OpenAccount = ({ fund, onClose }) => {
  const customer_id = localStorage.getItem("customerId");
  const [fundAccounts, setFundAccounts] = useState([]);
  const [linkedAccount, setLinkedAccount] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await RefreshToken.get(
          `http://localhost:8081/api/accounts/allAccount/${customer_id}`
        );
        console.log("✅ 응답 확인:", res.data);
        const allAccounts = Object.values(res.data).flat();
        setFundAccounts(allAccounts);
      } catch (error) {
        console.error("펀드 계좌 조회 실패", error);
        setFundAccounts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [customer_id]);

  const handleOpenAccount = async () => {
    const payload = {
      customerId: customer_id,
      fundAccountPassword: password,
      linkedAccountNumber: linkedAccount,
      fundAccountName: accountName,
    };

    try {
      await RefreshToken.post("http://localhost:8081/api/fund/open", payload);
      alert("펀드 계좌 개설 신청이 완료되었습니다.");
      setLinkedAccount("");
      setPassword("");
      setAccountName("");
    } catch (error) {
      console.error("계좌 개설 실패", error);
      alert("계좌 개설 중 오류가 발생했습니다.");
    }
  };

  const handleBuy = async () => {
    const payload = {
      customer_id,
      fundAccountId: selectedAccountId,
      fundId: fund?.fund_id,
      fundTransactionType: "BUY",
      fundInvestAmount: amount,
    };

    try {
      await RefreshToken.post("http://localhost:8081/api/fund/trade", payload);
      alert("매수가 완료되었습니다.");
      onClose();
    } catch (error) {
      console.error("매수 실패", error);
      alert("매수 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.fundAccountcontainer}>
      <h2 className={styles.fundAccounttitle}>펀드 상품 매수</h2>

      {Array.isArray(fundAccounts) && fundAccounts.length === 0 ? (
        <div className={styles.fundAccountform}>
          <p>⚠️ 아직 펀드 계좌가 없습니다. 개설 후 매수가 가능합니다.</p>

          <label>📄 보유 계좌 번호</label>
          <input
            type="text"
            value={linkedAccount}
            onChange={(e) => setLinkedAccount(e.target.value)}
            placeholder="보유계좌번호 입력"
          />

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

          <button
            className={styles.fundAccountbutton}
            onClick={handleOpenAccount}
          >
            펀드 계좌 개설하기
          </button>
        </div>
      ) : (
        <div className={styles.fundAccountform}>
          <p>💼 {fund?.fund_name} 펀드 매수</p>

          <label>📄 펀드 계좌 선택</label>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
          >
            <option value="">계좌를 선택하세요</option>
            {fundAccounts.map((acc) => (
              <option key={acc.accountNumber} value={acc.accountNumber}>
                {acc.accountNumber} ({acc.account_type})
              </option>
            ))}
          </select>

          <label>💰 매수 금액</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="예: 100000"
          />

          <button className={styles.fundAccountbutton} onClick={handleBuy}>
            매수하기
          </button>
        </div>
      )}

      <button className={styles.fundAccountcancel} onClick={onClose}>
        닫기
      </button>
    </div>
  );
};

export default OpenAccount;
