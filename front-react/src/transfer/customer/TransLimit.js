import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import Sidebar from './Sidebar';
import { getCustomerID } from '../../jwt/AxiosToken';
import '../../Css/transfer/TransLimit.css';

function TransLimit() {
  const [accounts, setAccounts] = useState([]);
  const [accountNumber, setAccountNumber] = useState('');
  const [requestedLimit, setRequestedLimit] = useState('');
  const [reason, setReason] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [currentLimit, setCurrentLimit] = useState(null); // 기존 승인된 한도

  // 고객 ID 설정 및 계좌 목록 조회
  useEffect(() => {
    const id = getCustomerID();
    if (!id) {
      alert('로그인이 필요합니다.');
      return;
    }

    setCustomerId(id);

    // 계좌 목록 조회
    RefreshToken.get(`http://localhost:8081/api/accounts/allAccount/${id}`)
      .then(res => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : Object.values(raw).flat();
        setAccounts(list);
      })
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  // 기존 승인 한도 조회
  useEffect(() => {
    if (customerId) {
      RefreshToken.get(`http://localhost:8081/api/transLimit/approvedLimit/${customerId}`)
        .then(res => setCurrentLimit(res.data))
        .catch(err => console.error("기존 한도 조회 실패:", err));
    }
  }, [customerId]);

  // 신청 등록
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accountNumber || !requestedLimit || !reason) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const data = {
      customer_id: customerId,
      out_account_number: accountNumber,
      requested_limit: requestedLimit,
      reason
    };

    RefreshToken.post('http://localhost:8081/api/transLimit/insert', data)
    .then(() => {
      alert('이체한도 변경 신청이 완료되었습니다.');
      setAccountNumber('');
      setRequestedLimit('');
      setReason('');
    })
    .catch(err => {
      if (err.response?.data === "이미 대기 중인 요청이 존재합니다.") {
        alert("이미 대기 중인 요청이 존재합니다.");
      } else {
        console.error('신청 실패:', err);
        alert('신청 중 오류 발생');
      }
    });
  };

  return (
    <div className="limit-container">
      <Sidebar />

      <div className="limit-form-box">
        <h2>1일 이체한도 변경신청</h2>
        <form onSubmit={handleSubmit}>
          <label>계좌선택</label>
          <select
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          >
            <option value="">-- 계좌 선택 --</option>
            {accounts.map((acc, idx) => (
              <option key={idx} value={acc.account_number}>
                {acc.account_number}
              </option>
            ))}
          </select>

          <label>1일한도 신청 금액</label>
          <input
            type="number"
            value={requestedLimit}
            onChange={e => setRequestedLimit(e.target.value)}
            placeholder="예: 1000000"
          />

          {/* 기존한도 표시 */}
          {currentLimit !== null && (
            <p style={{ marginTop: '5px', color: 'gray' }}>
              현재한도: {Number(currentLimit).toLocaleString()}원
            </p>
          )}

          <label>신청 사유</label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="사유를 입력해주세요"
          />

          <button type="submit">신청하기</button>
        </form>
      </div>
    </div>
  );
}

export default TransLimit;
