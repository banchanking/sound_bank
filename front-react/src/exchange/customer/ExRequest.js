import React, { useEffect, useState } from "react";
import { getCustomerID, getAuthToken } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";

const ExRequest = () => {
  // 고객 정보
  const customer_id = getCustomerID();

  // 상태 정의
  const [rates, setRates] = useState([]); // 환율 리스트
  const [selectedCurrency, setSelectedCurrency] = useState(""); // 선택된 통화
  const [transactionType, setTransactionType] = useState("buy"); // 거래 유형: "buy" or "sell"

  const [inputAmount, setInputAmount] = useState(""); // 입력 금액 (KRW 또는 외화)
  const [exchangedAmount, setExchangedAmount] = useState(""); // 계산된 환전 금액
  const [result, setResult] = useState(null); // 최종 결과 표시용

  const [accounts, setAccounts] = useState([]); // 사용자 계좌 리스트
  const [selectedAccount, setSelectedAccount] = useState(null); // 선택된 계좌 객체
  const [walletBalance, setWalletBalance] = useState(null); // 판매 시 필요한 외화 보유액

  // 환율 정보 불러오기
  useEffect(() => {
    RefreshToken
      .get("http://localhost:8081/api/exchange/rates")
      .then((res) => setRates(res.data))
      .catch((err) => console.error("환율 불러오기 실패", err));
  }, []);

  // 사용자 계좌 불러오기
  useEffect(() => {
    RefreshToken
      .get(`http://localhost:8081/api/exchange/account/${customer_id}`)
      .then((res) => setAccounts(res.data))
      .catch((err) => console.error("계좌 목록 불러오기 실패", err));
  }, [customer_id]);

  // 지갑 보유 외화 조회 (판매 시)
  useEffect(() => {
    if (transactionType === "sell") {
      RefreshToken
        .get(`http://localhost:8081/api/exchange/myWallet/${customer_id}`)
        .then((res) => {
          const wallet = res.data.find(w => w.currency_code === selectedCurrency);
          setWalletBalance(wallet ? parseFloat(wallet.balance) : 0);
        })
        .catch((err) => console.error("지갑 정보 불러오기 실패", err));
    } else {
      setWalletBalance(null);
    }
  }, [transactionType, selectedCurrency, customer_id]);

  // 거래 유형 및 금액 변경 시 환전 금액 계산
  useEffect(() => {
    const selected = rates.find((r) => r.cur_unit === selectedCurrency);
    if (selected && inputAmount) {
      const buyRate = parseFloat(selected.tts.replace(",", ""));
      const sellRate = parseFloat(selected.ttb.replace(",", ""));
      let result = 0;

      if (transactionType === "buy") {
        result = (parseFloat(inputAmount) / buyRate).toFixed(2); // 원화 → 외화
      } else {
        result = (parseFloat(inputAmount) * sellRate).toFixed(0); // 외화 → 원화
      }

      setExchangedAmount(result);
    } else {
      setExchangedAmount("");
    }
  }, [selectedCurrency, inputAmount, rates, transactionType]);

  // 거래 요청 처리
  const handleSubmit = () => {
    if (!selectedAccount) {
      alert("출금 계좌를 선택해주세요.");
      return;
    }
    if (transactionType === "sell" && parseFloat(inputAmount) > walletBalance) {
      alert("보유 외화를 초과하여 판매할 수 없습니다.");
      return;
    }

    const selectedRate = rates.find((r) => r.cur_unit === selectedCurrency);
    const dto = {
      customer_id,
      currency_code: selectedCurrency,
      transaction_type: transactionType,
      exchange_rate: transactionType === "buy"
        ? parseFloat(selectedRate.tts.replace(",", ""))
        : parseFloat(selectedRate.ttb.replace(",", "")),
      withdraw_account_number: selectedAccount.account_number,
    };

    if (transactionType === "buy") {
      dto.request_amount = parseInt(inputAmount); // 원화
      dto.exchanged_amount = parseFloat(exchangedAmount); // 외화
    } else {
      dto.request_amount = parseFloat(inputAmount); // 외화
      dto.exchanged_amount = parseInt(exchangedAmount); // 원화
    }

    RefreshToken
      .post("http://localhost:8081/api/exchange/walletCharge", dto)          
      .then((res) => {
        setResult(res.data);
        alert("거래가 완료되었습니다.");
      })
      .catch((err) => {
        console.error("환전 신청 실패", err);
        alert("거래 실패");
      });
  };

  return (
    <div style={{ maxWidth: "650px", margin: "40px auto", fontFamily: "sans-serif", minHeight: "570px" }}>
      <h2>💱 외환 거래</h2>

      {/* 거래 유형 선택 */}
      <label>거래 유형</label>
      <select
        value={transactionType}
        onChange={(e) => setTransactionType(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      >
        <option value="buy">외화 구매 (KRW → 외화)</option>
        <option value="sell">외화 판매 (외화 → KRW)</option>
      </select>

      {/* 출금 계좌 선택 */}
      <label>출금 계좌</label>
      <select
        onChange={(e) => {
          const acc = accounts.find((a) => a.account_number === e.target.value);
          setSelectedAccount(acc);
        }}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      >
        <option value="">-- 계좌 선택 --</option>
        {accounts.map((acc) => (
          <option key={acc.account_number} value={acc.account_number}>
            {acc.account_number}
          </option>
        ))}
      </select>

      {/* 계좌 잔액 표시 */}
      {selectedAccount && (
        <p style={{ marginBottom: "1rem" }}>
          <strong>잔액: ₩{Number(selectedAccount.balance).toLocaleString()}</strong>
        </p>
      )}

      {/* 통화 선택 */}
      <label>통화 선택</label>
      <select
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      >
        <option value="">-- 통화 선택 --</option>
        {rates.map((r) => (
          <option key={r.cur_unit} value={r.cur_unit}>
            {r.cur_unit} ({r.cur_nm})
          </option>
        ))}
      </select>

      {/* 판매 시 보유 외화 표시 */}
      {transactionType === "sell" && selectedCurrency && (
        <p style={{ marginBottom: "1rem" }}>
          <strong>보유 {selectedCurrency}: {walletBalance ?? 0}</strong>
        </p>
      )}

      {/* 금액 입력 */}
      <label>{transactionType === "buy" ? "환전할 금액 (KRW)" : "판매할 외화 금액"}</label>
      <input
        type="number"
        placeholder={transactionType === "buy" ? "예: 100000" : "예: 100"}
        value={inputAmount}
        onChange={(e) => setInputAmount(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />

      {/* 실시간 환전 결과 표시 */}
      {exchangedAmount && (
        <p>
            예상 환전 결과: <strong>{transactionType === "buy"
            ? `${exchangedAmount} ${selectedCurrency}`
            : `${parseInt(exchangedAmount).toLocaleString()} KRW`}</strong>
        </p>
      )}

      {/* 거래 버튼 */}
      <button
        onClick={handleSubmit}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "0.75rem 1.5rem",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "1rem",
        }}
        disabled={!selectedAccount || !selectedCurrency || !inputAmount}
      >
        {transactionType === "buy" ? "환전 신청" : "외화 판매"}
      </button>

      {/* 거래 결과 표시 */}
      {result && (
        <div style={{ marginTop: "2rem", backgroundColor: "#f9f9f9", padding: "1rem", borderRadius: "8px" }}>
          <h3>거래 완료</h3>
          <p>
            {result.request_amount.toLocaleString()} {transactionType === "buy" ? "KRW" : selectedCurrency}
            {" → "}
            {result.exchanged_amount} {transactionType === "buy" ? selectedCurrency : "KRW"}
          </p>
          <p>거래 시간: {new Date(result.exchange_transaction_date).toLocaleString()}</p>
          <button>
            <a href="/exchange_wallet_status" style={{ textDecoration: "none", color: "inherit" }}>
              지갑으로 이동
             </a>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExRequest;
