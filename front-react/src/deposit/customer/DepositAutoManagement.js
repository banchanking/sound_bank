import React, { useState, useEffect } from "react";
import { getCustomerID } from "../../jwt/AxiosToken";
import RefreshToken from "../../jwt/RefreshToken";
import "../../Css/depositcss/DepositAutoManagement.css"; // 사뱅스타일 적용

/**
 * DepositSavingsManagement
 * 예적금 자동이체 리스트 조회 및 삭제 화면
 */
const DepositSavingsManagement = () => {
  const [autoTransfers, setAutoTransfers] = useState([]);
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
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
      const accounts = res.data['입출금'] || [];
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
      console.log("자동이체 API 응답:", res.data);
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
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
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
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {autoTransfers
              .filter(transfer => transfer && transfer.targetAccountNumber)
              .map((transfer) => (
                <tr key={`${transfer.targetAccountNumber}-${transfer.transferDay}`}>
                  <td>{transfer.targetAccountNumber} ({transfer.targetAccountType === "DEPOSIT" ? "예금" : "적금"})</td>
                  <td>{Number(transfer.transferAmount).toLocaleString()} 원</td>
                  <td>{transfer.transferDay}일</td>
                  <td>
                    <button className="autoTransferManage-btn" onClick={() => handleDelete(transfer.id)}>삭제</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DepositSavingsManagement;
