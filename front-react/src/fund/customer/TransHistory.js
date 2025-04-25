// ✅ TransHistory.js - 모달에 닫기 버튼 추가
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RefreshToken from "../../jwt/RefreshToken";
import styles from "../../Css/fund/MyFund.module.css";
import FundCustomer from "../admin/FundCustomer";
import MyFund from "./MyFund";
import { Chart } from "react-google-charts";
import Papa from "papaparse";

const TransHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [closedAccounts, setClosedAccounts] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [password, setPassword] = useState("");
  const [fundRates, setFundRates] = useState({});

  const openModal = (type) => {
    setModalType(type);
    setSelectedTx(null);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedTx(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setShowModal(true);
      return;
    }
    fetchTransactions();
    fetchClosedAccounts();
    parseFundRates();
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

  const parseFundRates = () => {
    Papa.parse("/data/fundList_updated.csv", {
      header: true,
      download: true,
      complete: (results) => {
        const map = {};
        results.data.forEach((row) => {
          const name = row.fund_name?.trim();
          if (name) {
            map[name] = {
              return_12m: parseFloat(row.return_12m || 0)
            };
          }
        });
        setFundRates(map);
      },
    });
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
      alert("환매 신청이 완료되었습니다.");
      setPassword("");
      setSelectedTx(null);
      fetchTransactions();
    } else {
      alert("비밀번호가 틀렸습니다");
    }
  };

  const handleConfirm = () => navigate("/login");
  const handleCancel = () => navigate("/");

  const formatCurrency = (value) => `${Math.round(value).toLocaleString()}원`;

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
        <div className={styles.fundTable}>
          <br></br><br></br>
          <button className={styles.fundbuttonGroup} onClick={() => openModal("BUY")}>펀드 매수 내역</button>
          <button className={styles.fundbuttonGroup} onClick={() => openModal("SELL")}>펀드 환매 내역</button>
          <button className={styles.fundbuttonGroup} onClick={() => openModal("CLOSED")}>해지된 My펀드</button>
        </div>

        {modalType && !selectedTx && (
          <div className={styles.fundmodalOverlay}>
            <div className={styles.fundmodalContent}>
              <MyFund
                type={modalType}
                onClose={closeModal}
                transactions={transactions}
                closedAccounts={closedAccounts}
                onSellRequest={(tx) => {
                  setSelectedTx(tx);
                  setModalType(null);
                }}
              />
            </div>
          </div>
        )}

        {selectedTx && (() => {
          const name = selectedTx.fund_name ? selectedTx.fund_name.trim() : "";
          const price = parseFloat(selectedTx.fundPricePerUnit || 0);
          const units = parseFloat(selectedTx.fundUnitsPurchased || 0);
          const rate = fundRates[name]?.return_12m || 0;
          const currentPrice = price * (1 + rate / 100);
          const currentValue = currentPrice * units;

          return (
            <div className={styles.fundmodalOverlay}>
              <div className={styles.fundmodalContent}>
                <button className={styles.modalCloseBtn} onClick={closeModal}>X</button>
                <h3>{selectedTx.fund_name} 정산 요약</h3>
                <Chart
                  chartType="ColumnChart"
                  data={[
                    ["구분", "금액", { role: "style" }],
                    ["매수 시점", price * units, "#2d8cf0"],
                    ["현재 평가금액", currentValue, "#34c38f"]
                  ]}
                  options={{
                    title: "매수 vs 현재 평가금액",
                    legend: { position: "none" },
                    hAxis: { title: "구분" },
                    vAxis: { title: "금액 (원)" }
                  }}
                  width="100%"
                  height="300px"
                />
                <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                  현재 평가 금액: {formatCurrency(currentValue)}
                </p>
                <div style={{ marginTop: "20px" }}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="펀드 계좌 비밀번호"
                  />
                  <button onClick={handleSellConfirm}>환매 신청</button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
};

export default TransHistory;
