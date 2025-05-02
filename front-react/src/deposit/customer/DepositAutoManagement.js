import React, { useState, useEffect } from "react";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/depositcss/DepositAutoManagement.css";

const DepositSavingsManagement = () => {
  const [autoTransfers, setAutoTransfers] = useState([]);
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const customerId = getCustomerID();

  useEffect(() => {
    if (!customerId) {
      alert("로그인이 필요합니다.");
      return;
    }
    fetchWithdrawAccount();
  }, [customerId]);

  const fetchWithdrawAccount = async () => {
    try {
      const res = await RefreshToken.get(`/accounts/allAccount/${customerId}`);
      const accounts = res.data["입출금"] || [];
      setAccounts(accounts);
      if (accounts.length > 0) {
        const accountNumber = accounts[0].account_number;
        setWithdrawAccount(accountNumber);
        fetchAutoTransfers(accountNumber);
      }
    } catch (error) {
      console.error("기본 계좌 조회 실패:", error);
      alert("기본 계좌를 불러오는데 실패했습니다.");
    }
  };

  const fetchAutoTransfers = async (accountNumber) => {
    try {
      const res = await RefreshToken.get(`/auto-transfer/list/${accountNumber}`);
      setAutoTransfers(res.data);
    } catch (error) {
      console.error("자동이체 리스트 조회 실패:", error);
      alert("자동이체 리스트를 불러오는데 실패했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await RefreshToken.delete(`/auto-transfer/delete/${id}`);
      alert("삭제되었습니다.");
      fetchAutoTransfers(withdrawAccount);
      window.location.reload()
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleUpdate = async () => {
    if (!editTarget) return;

    try {
      const payload = {
        ...editTarget,
        transferAmount: Number(String(editTarget.transferAmount).replace(/,/g, ""))
      };

      await RefreshToken.put("/auto-transfer/update", payload);
      alert("수정 완료");
      setEditTarget(null);
      fetchAutoTransfers(withdrawAccount);
      window.location.reload()
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 실패");
    }
  };

  const handleOpenModal = (transfer) => {
    setEditTarget({ ...transfer });
  };

  const handleChange = (field, value) => {
    if (field === "transferAmount") {
      const raw = value.replace(/,/g, "").replace(/\D/g, "");
      const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setEditTarget((prev) => ({
        ...prev,
        [field]: formatted,
      }));
    } else {
      setEditTarget((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCloseModal = () => {
    setEditTarget(null);
  };

  return (
    <div className="autoTransferManage-container">
      <h2 className="autoTransferManage-title">예적금 자동이체 관리</h2>

      {autoTransfers.length === 0 ? (
        <p className="autoTransferManage-empty">등록된 자동이체가 없습니다.</p>
      ) : (
        <table className="autoTransferManage-table">
          <thead>
            <tr>
              <th>입금 계좌</th>
              <th>금액</th>
              <th>이체일자</th>
              <th>관리</th> {/* 수정 + 삭제 묶은 제목 */}
            </tr>
          </thead>
          <tbody>
            {autoTransfers.map((transfer) => (
              <tr key={transfer.id}>
                <td>{transfer.targetAccountNumber} ({transfer.targetAccountType === "DEPOSIT" ? "예금" : "적금"})</td>
                <td>{Number(transfer.transferAmount).toLocaleString()} 원</td>
                <td>{transfer.transferDay}일</td>
                <td>
                  <div className="autoTransferManage-action-buttons">
                    <button className="autoTransferManage-edit" onClick={() => handleOpenModal(transfer)}>수정</button>
                    <button className="autoTransferManage-btn" onClick={() => handleDelete(transfer.id)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editTarget && (
        <div className="autoTransferManage-modal-overlay">
          <div className="autoTransferManage-modal-box">
            <h3>자동이체 수정</h3>
            <label>금액</label>
            <input
              type="text"
              value={editTarget.transferAmount}
              onChange={(e) => handleChange("transferAmount", e.target.value)}
            />
            <label>이체일자 (1~28일)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input className="dayChange"
                type="number"
                min="1"
                max="28"
                value={editTarget.transferDay}
                onChange={(e) => handleChange("transferDay", e.target.value)}
              />
             
            </div>
            <div className="autoTransferManage-modal-buttons">
              <button onClick={handleUpdate}>저장</button>
              <button onClick={handleCloseModal}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositSavingsManagement;
