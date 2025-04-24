import React,{useEffect, useState} from "react";
import RefreshToken from "../../jwt/RefreshToken";
import { getCustomerID, getAuthToken } from "../../jwt/AxiosToken";
import styles from "../../Css/exchange/ExRequestList.module.css";

const ExRequestList = () => {
  const [requests, setRequests] = useState([]); // 환전 신청 목록
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 확인
  const customerId = getCustomerID();

  useEffect(() => {
    RefreshToken.get(`http://localhost:8081/api/exchange/requestList`)
      .then((res) => {
        setRequests(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.error("환전 신청 목록 조회 실패", err);
      });
  }, [customerId]);

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
            {isAdmin && <th>관리</th>}
          </tr>
        </thead>
        <tbody>
          {requests.map((req, idx) => (
            <tr key={idx}>
              <td>{req.exchange_transaction_id}</td>
              <td>{req.customer_id}</td>
              <td>{req.withdraw_account_number}</td>           
              <td>{req.request_amount.toLocaleString()} {req.from_currency}</td>              
              <td>{req.exchanged_amount.toLocaleString()} {req.to_currency}</td>
              <td>{req.exchange_transaction_date?.slice(0, 10)}</td>
              <td>{req.approval_status}</td>              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExRequestList;
