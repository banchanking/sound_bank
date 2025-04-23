import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/FundAccount.module.css";
import MyFund from "./MyFund";  // 로그인 체크용 팝업 컴포넌트

const OpenAccount = () => {
  const navigate = useNavigate();
  const customer_id = localStorage.getItem("customerId");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [showModal, setShowModal] = useState(false);

  // 로그인 체크 + 기존 보유계좌 조회 (입출금/예금 등)
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }

    const fetchAccounts = async () => {
      try {
        const res = await RefreshToken.get(
          `/accounts/allAccount/${customer_id}`
        );
        const allAccounts = Object.values(res.data).flat(); // 입출금 + 예금 합침
        setAccounts(allAccounts);
      } catch (err) {
        console.error("계좌 불러오기 실패:", err);
      }
    };

    fetchAccounts();
  }, [customer_id]);

  // 개설 요청
  const handleSubmit = async () => {
    if (!selectedAccount || !inputPassword) {
      alert("계좌와 비밀번호를 모두 입력해주세요.");
      return;
    }

    const payload = {
      customerId: customer_id,
      linkedAccountNumber: selectedAccount,
      fundAccountName: accountName,
      fundAccountPassword: inputPassword // 여기서 백엔드에 inputPassword처럼 전송
    };

    try {
      const res = await RefreshToken.post("/fund/open/verified", payload);
      alert(res.data); // service에서 넘긴 return문 "펀드 계좌 개설 신청 완료"
      setSelectedAccount("");
      setInputPassword("");
      setAccountName("");
    } catch (error) {
      console.error("계좌 개설 실패", error);
      alert("계좌 개설 중 오류가 발생했습니다.");
    }
  };

  // 모달 핸들러
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

    <div className={styles.fundAccountcontainer}>
      <h2 className={styles.fundAccounttitle}>My펀드 계좌개설</h2>
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
            <option disabled>보유계좌가 없습니다</option>
          )}
        </select>

        <label>🔒 보유 계좌 비밀번호</label>
        <input
          type="password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          placeholder="입출금 계좌 비밀번호 입력"
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
    </>
  );
};

export default OpenAccount;
