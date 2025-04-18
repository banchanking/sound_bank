import React, { useEffect, useState } from "react";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import useExchangeRates from "./useExchangeRates";

const ExRequest = () => {
  const customer_id = getCustomerID();

  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [transactionType, setTransactionType] = useState("buy");
  const [inputAmount, setInputAmount] = useState("");
  const [exchangedAmount, setExchangedAmount] = useState("");
  const [result, setResult] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null); 
  const [wallets, setWallets] = useState([]); // 지갑 목록 상태 

  const today = new Date().toISOString().split("T")[0];
  const { rates } = useExchangeRates(today);



  // 입력 시 처리
  const handleInputChange = (e) => {
    let rawValue = e.target.value.replace(/,/g, "");
  
    // 숫자 or 소수점만 허용 (정규표현식으로 필터링)
    if (!/^\d*\.?\d*$/.test(rawValue)) return;
  
    // 소수점 입력 중일 때는 toLocaleString() 하면 안 됨 (계속 날아감)
    if (rawValue.includes(".")) {
      setInputAmount(rawValue); // 소수점 그대로 유지
    } else if (rawValue) {
      const [intPart, decimalPart] = rawValue.split(".");
      const formatted = Number(intPart).toLocaleString();
      setInputAmount(decimalPart !== undefined ? `${formatted}.${decimalPart}` : formatted);
    } else {
      setInputAmount("");
    }
  };
  

  useEffect(() => {
    RefreshToken
      .get(`http://localhost:8081/api/exchange/account/${customer_id}`)
      .then((res) => setAccounts(res.data))
      .catch((err) => console.error("계좌 목록 불러오기 실패", err));
  }, [customer_id]);

  useEffect(() => {
    RefreshToken
      .get(`http://localhost:8081/api/exchange/myWallet/${customer_id}`)
      .then((res) => {
        setWallets(res.data); // 전체 지갑 목록 저장
        const wallet = res.data.find(w => w.currency_code === selectedCurrency);
        setWalletBalance(wallet ? parseFloat(wallet.balance) : 0);
      })
      .catch((err) => console.error("지갑 정보 불러오기 실패", err));
  }, [transactionType, selectedCurrency, customer_id]);

  useEffect(() => {
    const selected = rates.find((r) => r.currency_code === selectedCurrency);
    if (selected && inputAmount) {
      const feeRate = selected.fee_rate ?? 0; // 없을 경우 0%
      const numericAmount = Number(inputAmount.replace(/,/g, ""));
      let result = 0;
  
      if (transactionType === "buy") {
        // 구매: 수수료 추가된 환율로 계산 (예: 1320 * 1.015)
        const adjustedBuyRate = selected.buy_rate * (1 + feeRate / 100);
        result = (numericAmount / adjustedBuyRate).toFixed(2); // 외화
      } else {
        // 판매: 수수료 차감된 환율로 계산 (예: 1280 * 0.985)
        const adjustedSellRate = selected.sell_rate * (1 - feeRate / 100);
        result = (numericAmount * adjustedSellRate).toFixed(0); // 원화
      }
      
      setExchangedAmount(result);
    } else {
      setExchangedAmount("");
    }
  }, [selectedCurrency, inputAmount, rates, transactionType]);

  const handleSubmit = () => {
    if (!selectedAccount) {
      alert("출금 계좌를 선택해주세요.");
      return;
    }
    if (transactionType === "sell" && parseFloat(inputAmount) > walletBalance) {
      alert("보유 외화를 초과하여 판매할 수 없습니다.");
      return;
    }

    const selectedRate = rates.find((r) => r.currency_code === selectedCurrency);
    const dto = {
      customer_id,
      withdraw_account_number: selectedAccount.account_number,
      transaction_type: transactionType,
      exchange_rate: transactionType === "buy" ? selectedRate.buy_rate : selectedRate.sell_rate,
      currency_code: selectedCurrency,
      from_currency: transactionType === "buy" ? "KRW" : selectedCurrency,
      to_currency: transactionType === "buy" ? selectedCurrency : "KRW",
    };

    if (transactionType === "buy") {
      dto.request_amount = Number(inputAmount.replace(/,/g, "")); // 원화
      dto.exchanged_amount = parseFloat(exchangedAmount);        // 외화
    } else {
      dto.request_amount = parseFloat(inputAmount.replace(/,/g, "")); // 외화 (소수점 포함)
      dto.exchanged_amount = parseInt(exchangedAmount);               // 원화 (정수)
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
      <ul>
        <li>100만원 이상의 구매거래는 관리자의 승인이 필요합니다.</li>
      </ul>

      <label>거래 유형</label>
      <select
        value={transactionType}
        onChange={(e) => setTransactionType(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      >
        <option value="buy">외화 구매 (KRW → 외화)</option>
        <option value="sell">외화 판매 (외화 → KRW)</option>
      </select>

      <label>입출금 계좌</label>
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

      {selectedAccount && (
        <p style={{ marginBottom: "1rem" }}>
          <strong>잔액: ₩{Number(selectedAccount.balance).toLocaleString()}</strong>
        </p>
      )}

      <label>통화 선택</label>
      <select
        value={selectedCurrency}
        onChange={(e) => setSelectedCurrency(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      >
        <option value="">-- 통화 선택 --</option>
        {(transactionType === "buy" ? rates : rates.filter((r) =>
          wallets.some((w) => w.currency_code === r.currency_code)
        )).map((r) => (
          <option key={r.currency_code} value={r.currency_code}>
            {r.currency_code} ({r.currency_name})
          </option>
        ))}
      </select>

      {transactionType === "sell" && selectedCurrency && (
        <p style={{ marginBottom: "1rem" }}>
          <strong>보유 {selectedCurrency}: {walletBalance ?? 0}</strong>
        </p>
      )}

      <label>
        {transactionType === "buy" ? "환전할 금액 (KRW)" : "판매할 외화 금액"}
      </label>
      <input
        type="text"
        placeholder={transactionType === "buy" ? "예: 100000" : "예: 100.12"}
        value={inputAmount}
        onChange={handleInputChange}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />

      {exchangedAmount && (
        <p>
          예상 환전 결과: <strong>{transactionType === "buy"
            ? `${exchangedAmount} ${selectedCurrency}`
            : `${parseInt(exchangedAmount).toLocaleString()} KRW`}</strong>
        </p>
      )}

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
      <p style={{ fontSize: "0.9rem", color: "#888" }}>
            ※ 위 환전 금액은 수수료가 포함된 환율 기준으로 계산되었습니다.
      </p>
      {result && (
        <div style={{ marginTop: "2rem", backgroundColor: "#f9f9f9", padding: "1rem", borderRadius: "8px" }}>
          <h3>거래 요청 완료</h3>
          <p>
            {result.request_amount.toLocaleString()} {transactionType === "buy" ? "KRW" : selectedCurrency}
            {" → "}
            {result.exchanged_amount.toLocaleString()} {transactionType === "buy" ? selectedCurrency : "KRW"}
          </p>
          <p>
            거래 시간:{" "}
            {result.exchange_transaction_date
              ? result.exchange_transaction_date.replace("T", " ")
              : "시간 정보 없음"}
          </p>
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
