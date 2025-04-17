import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import '../../Css/transfer/AdminLimit.css';

function AdminLimit() {
  const [requests, setRequests] = useState([]);

  // 승인 또는 거절 처리
  const handleAction = (item, action) => {
    const { transfer_id, requested_limit } = item;

    if (action === 'reject') {
      const reason = prompt('거절 사유를 입력하세요:');
      if (!reason) return;

      RefreshToken.post('http://localhost:8081/api/transLimit/admin/reject', {
        transfer_id,
        reject_reason: reason
      })
        .then(() => {
          alert('거절 완료');
          setRequests(prev =>
            prev.map(row =>
              row.transfer_id === transfer_id
                ? { ...row, status: '거절', approval_date: new Date().toISOString(), reject_reason: reason }
                : row
            )
          );
        })
        .catch(err => {
          console.error('거절 실패:', err);
          alert('거절 실패');
        });

    } else if (action === 'approve') {
      RefreshToken.post('http://localhost:8081/api/transLimit/admin/approve', {
        transfer_id,
        approval_limit: requested_limit
      })
        .then(() => {
          alert('승인 완료');
          setRequests(prev =>
            prev.map(row =>
              row.transfer_id === transfer_id
                ? {
                    ...row,
                    status: '승인',
                    approval_limit: requested_limit,
                    approval_date: new Date().toISOString()
                  }
                : row
            )
          );
        })
        .catch(err => {
          console.error('승인 실패:', err);
          alert('승인 실패');
        });
    }
  };

  // 요청 목록 조회
  useEffect(() => {
    RefreshToken.get('http://localhost:8081/api/transLimit/admin/list')
      .then(res => setRequests(res.data))
      .catch(err => {
        console.error('요청 목록 조회 실패:', err);
        alert('조회 실패');
      });
  }, []);

  return (
    <div className="admin-limit-container">
      <div className="admin-limit-content">
        <h2>이체한도 변경 요청 목록 (관리자)</h2>

        <table className="admin-limit-table">
          <thead>
            <tr>
              <th>신청자</th>
              <th>계좌번호</th>
              <th>신청사유</th>
              <th>요청한도</th>
              <th>신청일</th>
              <th>처리상태</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item, index) => (
              <tr key={index}>
                <td>{item.customer_id}</td>
                <td>{item.out_account_number}</td>
                <td>{item.reason}</td>
                <td>{Number(item.requested_limit).toLocaleString()}원</td>
                <td>{item.request_date ? new Date(item.request_date).toLocaleString() : '-'}</td>
                <td>
                  {item.status === '대기' || !item.status ? (
                    <>
                      <button
                        onClick={() => handleAction(item, 'approve')}
                        className="btn-approve"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleAction(item, 'reject')}
                        className="btn-reject"
                      >
                        반려
                      </button>
                    </>
                  ) : item.status === '승인' ? (
                    <div>
                      승인됨<br />
                      승인한도: {Number(item.approval_limit).toLocaleString()}원<br />
                      승인일: {item.approval_date ? new Date(item.approval_date).toLocaleString() : '-'}
                    </div>
                  ) : item.status === '거절' ? (
                    <div>
                      반려됨<br />
                      반려일: {item.approval_date ? new Date(item.approval_date).toLocaleString() : '-'}<br />
                      사유: {item.reject_reason || '-'}
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminLimit;
