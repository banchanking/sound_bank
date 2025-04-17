import React,{useEffect, useState} from "react";
import RefreshToken from "../../jwt/RefreshToken";
import { getCustomerID, getAuthToken } from "../../jwt/AxiosToken";
import styles from "../../Css/exchange/ExRequestList.module.css"
const AdminExAccountRequestList = () => {
  
  const [requests, setRequests] = useState([]); // 환전 신청 목록
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 확인
  const customer_id = getCustomerID();

  useEffect(() => {
    RefreshToken
      .get(`http://localhost:8081/api/exchange/requestList/${customer_id}`)      
      .then((res) => {
        setRequests(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.error("환전 신청 목록 조회 실패", err);
      });
  }, [customer_id]);

  // 승인 혹은 거절 핸들러
  const handleApproval = async (approvalData) => {
    console.log("승인 처리 요청:", approvalData);
  
    try {
      await RefreshToken.put(`/exchange/admin/approval`, approvalData);
      alert(`요청이 ${approvalData.approval_status === "APPROVED" ? "승인" : "거절"}되었습니다.`);
  
      const res = await RefreshToken.get(`/exchange/requestList/${approvalData.customer_id}`);
      setRequests(res.data);
    } catch (error) {
      console.error("승인/거절 처리 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };
  
  

  return (

      <div className={styles.container}>
      <h2 className={styles.title}>환전 신청 현황</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>신청 번호</th>
            <th>신청자 ID</th>
            <th>출금계좌</th>
            <th>환전신청금액</th>       
            <th>환전요청금액</th>            
            <th>신청일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, idx) => (
            <tr key={idx}>
              <td>{req.exchange_transaction_id}</td>
              <td>{req.customer_id}</td>
              <td>{req.withdraw_account_number}</td>           
              <td>{req.request_amount} {req.from_currency}</td>              
              <td>{req.exchanged_amount} {req.to_currency}</td>
              <td>{req.exchange_transaction_date?.slice(0, 10)}</td>
              <td>{req.approval_status}</td>
              <td className={styles.actions}>
              <button onClick={() => handleApproval({
                  exchange_transaction_id: req.exchange_transaction_id,
                  approval_status: "APPROVED",
                  customer_id: req.customer_id,
                  withdraw_account_number: req.withdraw_account_number,
                  request_amount: req.request_amount,
                  currency_code: req.currency_code
                })}>
                  승인
              </button>

                <button onClick={() => handleApproval({
                  exchange_transaction_id: req.exchange_transaction_id,
                  approval_status: "REJECTED",
                  customer_id: req.customer_id
                })}>
                  거절
              </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminExAccountRequestList;
