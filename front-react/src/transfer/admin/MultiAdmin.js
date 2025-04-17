import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import '../../Css/transfer/MultiAdmin.css';

function TransMultiApprove() {
  const [groupedList, setGroupedList] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const token = localStorage.getItem('auth_token');
  const [loading, setLoading] = useState(false);

  // 초기 승인 목록 조회
  useEffect(() => {
    RefreshToken.get('http://localhost:8081/api/multiAdmin/approveList', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const rawList = res.data;
      const grouped = {};

      rawList.forEach(item => {
        const key = `${item.customer_id}_${item.request_date}`;
        if (!grouped[key]) {
          grouped[key] = {
            key,
            customer_id: item.customer_id,
            request_date: item.request_date,
            out_account_number: item.out_account_number,
            status: item.status,
            reject_reason: item.reject_reason,
            approval_date: item.approval_date,
            children: []
          };
        }
        grouped[key].children.push(item);
      });

      setGroupedList(Object.values(grouped));
    })
    .catch(err => {
      console.error('목록 조회 실패:', err);
      alert('요청 목록 불러오기 실패');
    });
  }, []);

  // 승인
  const handleApprove = (group) => {
    setLoading(true);
    RefreshToken.post(`http://localhost:8081/api/multiAdmin/approveMultiGroup`, {
      customer_id: group.customer_id,
      request_date: group.request_date
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('승인 완료');
      window.location.reload();
    })
    .catch(() => alert('승인 실패'))
    .finally(() => setLoading(false));
  };

  // 반려
  const handleReject = (group) => {
    const reason = prompt('반려 사유를 입력하세요:');
    if (!reason) return;

    RefreshToken.post(`http://localhost:8081/api/multiAdmin/rejectMultiGroup`, {
      customer_id: group.customer_id,
      request_date: group.request_date,
      reason
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('반려 완료');
      window.location.reload();
    })
    .catch(() => alert('반려 실패'));
  };

  return (
    <div className="approve-wrap">
      <h2>다건이체 승인 관리</h2>

      <table className="approve-table">
        <thead>
          <tr>
            <th>고객ID</th>
            <th>출금계좌</th>
            <th>요청일</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {groupedList.map(group => (
            <React.Fragment key={group.key}>
              <tr>
                <td>{group.customer_id}</td>
                <td>{group.out_account_number}</td>
                <td>
                  {group.request_date
                    ? new Date(Number(group.request_date)).toLocaleString()
                    : '-'}
                </td>
                <td>
                  {group.status === '대기' ? '대기'
                  : group.status === '승인' ? '승인함'
                  : `반려함`}
                </td>
                <td>
                  {group.status === '대기' ? (
                    <>
                      <button onClick={() => setSelectedKey(group.key)} className="btn-detail">상세</button>
                      <button onClick={() => handleApprove(group)} className="btn-approve">승인</button>
                      <button onClick={() => handleReject(group)} className="btn-reject">반려</button>
                    </>
                  ) : group.status === '거절' ? (
                    <div>
                      반려함<br />
                      <span>
                        반려일: {group.approval_date
                          ? new Date(group.approval_date).toLocaleString()
                          : '-'}
                      </span>
                      <span>반려사유: {group.reject_reason || '-'}</span>
                    </div>
                  ) : group.status === '승인' ? (
                    <div>
                      승인함<br />
                      <span>
                        승인일: {group.approval_date
                          ? new Date(group.approval_date).toLocaleString()
                          : '-'}
                      </span>
                    </div>
                  ) : null}
                </td>

              </tr>
              {selectedKey === group.key && (
                <tr>
                  <td colSpan="5">
                    <table className="detail-table">
                      <thead>
                        <tr>
                          <th>입금계좌</th>
                          <th>받는사람</th>
                          <th>금액</th>
                          <th>메모</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.children.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.in_account_number}</td>
                            <td>{item.in_name}</td>
                            <td>{item.amount?.toLocaleString()}원</td>
                            <td>{item.memo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {loading && <div className="loading">처리중...</div>}
    </div>
  );
}

export default TransMultiApprove;