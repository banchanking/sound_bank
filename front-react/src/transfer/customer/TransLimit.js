import React, { useEffect, useState } from "react";
import RefreshToken from "../../jwt/RefreshToken";
import Sidebar from "./Sidebar";
import { getCustomerID } from "../../jwt/AxiosToken";
import { useNavigate } from "react-router-dom";
import styles from "../../Css/transfer/TransLimit.module.css";

function TransLimit() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [accountNumber, setAccountNumber] = useState("");
  const [requestedLimit, setRequestedLimit] = useState("");
  const [displayLimit, setDisplayLimit] = useState("");
  const [reason, setReason] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [currentLimit, setCurrentLimit] = useState(null);

  useEffect(() => {
    const id = getCustomerID();
    if (!id) {
      const goLogin = window.confirm(
        "로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
      );
      if (goLogin) {
        navigate("/login");
      } else {
        navigate("/");
      }
      return;
    }

    setCustomerId(id);

    RefreshToken.get(`/accounts/allAccount/${id}`)
      .then((res) => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : Object.values(raw).flat();
        setAccounts(list);
      })
      .catch((err) => console.error("계좌 불러오기 실패:", err));

    RefreshToken.get(`/transLimit/approvedLimit/${id}`)
      .then((res) => setCurrentLimit(res.data))
      .catch((err) => console.error("기존 한도 조회 실패:", err));
  }, []);

  const handleLimitChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setRequestedLimit(raw);
    setDisplayLimit(raw ? Number(raw).toLocaleString("ko-KR") : "");
  };

  const getAccountTypeLabel = (type) => {
    if (!type) return "";
    const t = type.toUpperCase();
    if (t === "CHECKING") return "입출금";
    if (t === "DEPOSIT") return "예금";
    if (t === "SAVINGS") return "적금";
    return type;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accountNumber || !requestedLimit || !reason) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const data = {
      customer_id: customerId,
      out_account_number: accountNumber,
      requested_limit: requestedLimit,
      reason,
    };

    RefreshToken.post("/transLimit/insert", data)
      .then(() => {
        alert("이체한도 변경 신청이 완료되었습니다.");
        setAccountNumber("");
        setRequestedLimit("");
        setDisplayLimit("");
        setReason("");
        navigate("/transLimitEdit");
      })
      .catch((err) => {
        if (err.response?.data === "이미 대기 중인 요청이 존재합니다.") {
          alert("이미 대기 중인 요청이 존재합니다.");
        } else {
          console.error("신청 실패:", err);
          alert("신청 중 오류 발생");
        }
      });
  };

  return (
    <div className={styles["limit-limitContainer"]}>
      <Sidebar />
      <div className={styles["limit-formBox"]}>
        <h2>1일 이체한도 변경신청</h2>
        <form onSubmit={handleSubmit}>
          <label>계좌선택</label>
          <select
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          >
            <option value="">-- 계좌 선택 --</option>
            {accounts
              .filter((account) => account.account_type === "입출금")
              .map((acc, idx) => (
                <option key={idx} value={acc.account_number}>
                  {acc.account_number} (
                  {getAccountTypeLabel(
                    acc.account_type || acc.dat_account_type
                  )}
                  )
                </option>
              ))}
          </select>

          <label>1일한도 신청 금액</label>
          <input
            type="text"
            value={displayLimit}
            onChange={handleLimitChange}
            placeholder="예: 5,000,000원"
          />
          {currentLimit !== null && (
            <p className={styles["limit-currentLimit"]}>
              현재한도: {Number(currentLimit).toLocaleString("ko-KR")}원
            </p>
          )}

          <label>신청 사유</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="사유를 입력해주세요"
          />

          <button type="submit" className={styles["limit-submitButton"]}>
            신청하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransLimit;
