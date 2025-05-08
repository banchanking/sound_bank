import React,{useEffect, useState} from "react";
import RefreshToken from "../../jwt/RefreshToken";
import { getCustomerID, getAuthToken } from "../../jwt/AxiosToken";
import styles from "../../Css/exchange/ExRequestList.module.css";
import { useNavigate } from "react-router-dom";

const ExRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]); // 환전 신청 목록
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 여부 확인
  const customerId = getCustomerID();

  const statusMap = {
    PENDING: "대기",
    APPROVED: "승인",
    REJECTED: "거절"
  };

  useEffect(() => {
    const id = getCustomerID();
        if (!id) {
          const customer_id = getCustomerID();
              if (!customer_id) {
                if (!customer_id) {
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
            }
        }
    
    RefreshToken.get(`/exchange/requestList/${customerId}`)
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
              <td>{statusMap[req.approval_status] || req.approval_status}</td> 
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExRequestList;
