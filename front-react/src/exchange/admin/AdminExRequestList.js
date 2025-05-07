import React,{useEffect, useState} from "react";
import RefreshToken from "../../jwt/RefreshToken";
import { getCustomerID, getAuthToken } from "../../jwt/AxiosToken";
import styles from "../../Css/exchange/ExRequestList.module.css";

const ExRequestList = () => {
  const [requests, setRequests] = useState([]); // 환전 신청 목록
  const customerId = getCustomerID();
  
  const statusMap = {
    PENDING: "대기",
    APPROVED: "승인",
    REJECTED: "거절"
  };
  useEffect(() => {
    RefreshToken.get(`/admin/requestList`)
      .then((res) => {
        setRequests(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.error("환전 신청 목록 조회 실패", err);
      });

    // 관리자 여부 확인 예시: 로컬스토리지에서 role 확인
    // const role = localStorage.getItem("role");
    // if (role === "ADMIN") {
    //   setIsAdmin(true);
    // }
  }, [customerId]);

  const handleApproval = async (approvalData) => {
    console.log("승인 처리 요청:", approvalData);

    try {
      await RefreshToken.put(`/admin/approval`, approvalData);
      alert(`요청이 ${approvalData.approval_status === "APPROVED" ? "승인" : "거절"}되었습니다.`);

      // 2) 초기 조회와 동일한 엔드포인트로 전체 목록 재조회
      const res = await RefreshToken.get(`/admin/requestList`);
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
            {/* {isAdmin &&  */}
            <th>관리</th>
             {/* } */}
          </tr>
        </thead>
        <tbody>
          {requests.map((req, idx) => (
            <tr key={idx}>
              <td>{req.EXCHANGE_TRANSACTION_ID}</td>
              <td>{req.CUSTOMER_ID}</td>
              <td>{req.WITHDRAW_ACCOUNT_NUMBER}</td>
              <td>
                {req.REQUEST_AMOUNT?.toLocaleString() || "-"} {req.FROM_CURRENCY}
              </td>
              <td>
                {req.EXCHANGED_AMOUNT?.toLocaleString() || "-"} {req.TO_CURRENCY}
              </td>
              <td>
                {req.EXCHANGE_TRANSACTION_DATE
                  ? new Date(req.EXCHANGE_TRANSACTION_DATE).toLocaleDateString()
                  : "-"}
              </td>
              <td>{statusMap[req.APPROVAL_STATUS] || req.APPROVAL_STATUS}</td>
              {/* {isAdmin &&  */}
              {/* ( */}
                <td className={styles.actions}>
                  <button
                    onClick={() =>
                      handleApproval({
                        exchange_transaction_id: req.EXCHANGE_TRANSACTION_ID,
                        approval_status: "APPROVED",
                        customer_id: req.CUSTOMER_ID,
                        withdraw_account_number: req.WITHDRAW_ACCOUNT_NUMBER,
                        request_amount: req.REQUEST_AMOUNT,
                        currency_code: req.CURRENCY_CODE,
                      })
                    }
                  >
                    승인
                  </button>
                  <button
                    onClick={() =>
                      handleApproval({
                        exchange_transaction_id: req.EXCHANGE_TRANSACTION_ID,
                        approval_status: "REJECTED",
                        customer_id: req.CUSTOMER_ID,
                      })
                    }
                  >
                    거절
                  </button>
                </td>
              {/* ) */}
              {/* } */}
            </tr>
          ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default ExRequestList;
