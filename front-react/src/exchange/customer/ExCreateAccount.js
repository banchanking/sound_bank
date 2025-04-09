import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../Css/exchange/ExCreateAccount.module.css";
import { useNavigate } from "react-router-dom"; 
import { getCustomerID } from "../../jwt/AxiosToken";

const ExCreateAccount = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [inputPwd, setInputPwd] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [currencyType, setCurrencyType] = useState("");
  const [exchangePwd, setExchangePwd] = useState("");
  const goToNext = () => setStep((prev) => prev + 1);

  const customer_id = getCustomerID();
  
  useEffect(() => {
    if (step === 2) {
      axios
        .get(`http://localhost:8081/api/exchange/account/${customer_id}`)
        .then((res) => setAccounts(res.data))
        .catch((err) => console.error("계좌 목록 조회 실패", err));
    }
  }, [step, customer_id]);

  const handlePwdCheck = async () => {
    if (!selectedAccount || !inputPwd || !currencyType || !exchangePwd) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8081/api/exchange/account/pwdChk", {
        account_number: selectedAccount,
        account_pwd: inputPwd,
      });

      alert(res.data); // 예: "확인 완료"
      goToNext();
    } catch (err) {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleCreateAccount = async () => {
    try {
      const ExchangeAccountRequestDTO = {
        CUSTOMER_ID: customer_id,
        WITHDRAW_ACCOUNT_NUMBER: selectedAccount,
        CURRENCY_TYPE: currencyType,
        EXCHANGE_ACCOUNT_PWD: exchangePwd,
      };
      console.log(ExchangeAccountRequestDTO);

      const res = await axios.post("http://localhost:8081/api/exchange/account/request", ExchangeAccountRequestDTO);
  
      alert("계좌 개설 요청이 완료되었습니다.");
      // 성공 시 페이지 이동
      if (res.status === 201) {
        alert("계좌 개설 요청이 완료되었습니다.");
        navigate("/admin_ex_request_list"); // ✅ 계좌 신청 현황 페이지로 이동
      }
    } catch (err) {
      console.error("계좌 개설 요청 실패", err);
      alert("요청에 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      {step === 1 && (
        <div className={styles.section}>
          <h2 style={{ textAlign: "center" }}>💡 상품 설명서</h2>
          <div className={styles.scrollBox}>
            <h4>상품명: 외환 거래 계좌 (USD)</h4>
            <p>
              본 상품은 USD(미국 달러)를 기반으로 한 외환 전용 계좌입니다. <br />
              환율 변동에 따라 이익 또는 손실이 발생할 수 있으며, 원금이 보장되지 않습니다. <br />
              외화 입출금 및 환전이 가능하며, 거래 내역은 실시간으로 확인할 수 있습니다. <br />
              고객의 투자 성향과 리스크 선호도를 충분히 고려하여 가입하시기 바랍니다.
            </p>
            <p style={{ fontWeight: "bold", color: "#aa0000" }}>
              ※ 이 상품은 예금자 보호 대상이 아닙니다.
            </p>
          </div>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginRight: "0.5rem" }}
            />
            상품 설명서를 모두 읽고 이해하였습니다.
          </label>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={goToNext}
              disabled={!agreed}
              className={styles.button}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={styles.section}>
          <h2>출금 계좌 정보 입력</h2>

          <label>* 출금 계좌 선택</label><br />
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className={styles.select}
          >
            <option value="">-- 계좌 선택 --</option>
            {accounts.map((acc) => (
              <option key={acc.account_number} value={acc.account_number}>
                {acc.account_number}
              </option>
            ))}
          </select>

          <label>* 출금 계좌 비밀번호</label><br />
          <input
            type="password"
            placeholder="출금 계좌 비밀번호 입력"
            value={inputPwd}
            onChange={(e) => setInputPwd(e.target.value)}
            className={styles.input}
          />

          <label>* 기본 통화 선택</label><br />
          <select
            value={currencyType}
            onChange={(e) => setCurrencyType(e.target.value)}
            className={styles.select}
          >
            <option value="">-- 통화 선택 --</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="JPY">JPY</option>
          </select>

          <label>* 신규 외환계좌 비밀번호</label><br />
          <input
            type="password"
            placeholder="신규 외환계좌 비밀번호 설정"
            value={exchangePwd}
            onChange={(e) => setExchangePwd(e.target.value)}
            className={styles.input}
          />

          <button onClick={handlePwdCheck} className={styles.button}>
            다음
          </button>
        </div>
      )}

      {step === 3 && (
        <div className={styles.section}>
          <h2>입력 정보 확인</h2>
          <div className={styles.confirmBox}>
            <p><strong>출금 계좌번호:</strong> {selectedAccount}</p>
            <p><strong>기본 통화:</strong> {currencyType}</p>            
          </div>
          <button onClick={goToNext} className={styles.button}>
            본인 인증으로
          </button>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2>본인 인증</h2>
          <p>본인 인증을 위해 아래 버튼을 클릭해주세요.</p>
          <button onClick={goToNext} className={styles.button}>
            본인 인증하기
          </button>
          
          <br/>
          <p style={{ marginTop: "1rem" }}>
            본인 인증이 완료되면 계좌 개설 요청을 진행할 수 있습니다.
          </p>
        </div>
      )}
      
      {step === 5 && (
        <div>
          <h2>본인 인증 완료</h2>
          <p>본인 인증이 완료되었습니다.</p>

          <button onClick={handleCreateAccount} style={{ marginTop: "1rem" }}>
            계좌 개설 요청
          </button>
        </div>
      )}

    </div>
  );
};

export default ExCreateAccount;
