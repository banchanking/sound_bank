import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";
import FundCustomer from "../admin/FundCustomer";
import MyFund from "./MyFund";

const TransHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [closedAccounts, setClosedAccounts] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [password, setPassword] = useState("");

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }
    fetchTransactions();
    fetchClosedAccounts();
  }, []);

  const fetchTransactions = async () => {
    const customerId = localStorage.getItem("customerId");
    const res = await RefreshToken.get(`/fundTrade/all/${customerId}`);
    setTransactions(res.data);
  };

  const fetchClosedAccounts = async () => {
    const customerId = localStorage.getItem("customerId");
    const res = await RefreshToken.get(`/fundAccount/closed/${customerId}`);
    setClosedAccounts(res.data);
  };

  const handleSellConfirm = async () => {
    const res = await RefreshToken.post("/fund/check-password", {
      linkedAccountNumber: selectedTx.withdrawAccountNumber,
      fundAccountPassword: password,
    });

    if (res.status === 200) {
      await RefreshToken.post("/fundTrade", {
        ...selectedTx,
        fundTransactionType: "SELL",
        fundTransactionDate: null,
        status: "PENDING",
      });
      alert("환매 신청 완료");
      setSelectedTx(null);
      setPassword("");
      fetchTransactions();
    } else {
      alert("비밀번호가 틀렸습니다");
    }
  };

  const handleConfirm = () => navigate("/login");
  const handleCancel = () => navigate("/");

  return (
    <>
      {showModal && (
        <FundCustomer
          message="로그인이 필요한 서비스입니다."
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <div className={styles.fundContainer}>
        <h2 className={styles.fundTitle}>My펀드 거래내역</h2>
        <br></br><br></br><br></br>
        <div className={styles.fundTable}>
          <button className={styles.fundbuttonGroup} onClick={() => openModal("BUY")}>펀드 매수 내역</button>
          <button className={styles.fundbuttonGroup} onClick={() => openModal("SELL")}>펀드 환매 내역</button>
          <button className={styles.fundbuttonGroup} onClick={() => openModal("CLOSED")}>해지된 My펀드</button>
        </div>

        {modalType && (
        <div className={styles.fundmodalOverlay}>
          <div className={styles.fundmodalContent}>
            <MyFund
              type={modalType}
              onClose={closeModal}
              transactions={transactions}
              closedAccounts={closedAccounts}
              onSellRequest={setSelectedTx}
            />
          </div>
        </div>
      )}

        {selectedTx && (
          <div style={{ marginTop: "20px" }}>
            <h4>환매 비밀번호 입력</h4>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="펀드 계좌 비밀번호"
            />
            <button onClick={handleSellConfirm}>환매 확인</button>
          </div>
        )}
      </div>
    </>
  );
};

export default TransHistory;