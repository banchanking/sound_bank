import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../Css/transfer/MultiAdmin.css';

function TransMultiApprove() {
  const [list, setList] = useState([]); // 전체 요청 목록
  const [details, setDetails] = useState([]); // 선택된 요청의 세부 이체건들
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const token = localStorage.getItem('auth_token');

  // 승인 요청 목록 불러오기
  useEffect(() => {
    axios.get('http://localhost:8081/api/multiAdmin/approveList', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setList(res.data))
    .catch(err => console.error('목록 조회 실패:', err));
  }, []);

  // 상세 보기 클릭 시
  const fetchDetails = (transfer_id) => {
    setSelectedId(transfer_id);

    axios.get(`http://localhost:8081/api/multiAdmin/approveDetail/${transfer_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setDetails(res.data))
    .catch(err => {
      console.error('상세 조회 실패:', err);
      alert('상세 조회 실패');
    });
};
  // 승인 처리
  const handleApprove = (transfer_id) => {
    setLoading(true); // 승인 처리 시 로딩 시작
    axios.post(`http://localhost:8081/api/multiAdmin/approveMulti/${transfer_id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('승인 완료');
      window.location.reload();
    })
    .catch(() => alert('승인 실패'))
    .finally(() => setLoading(false)); // 완료 후 로딩 종료
  };

  // 반려 처리
  const handleReject = (transfer_id) => {
    const reason = prompt('거절 사유를 입력하세요:');
    if (!reason) return;

    axios.post('http://localhost:8081/api/multiAdmin/rejectMulti', {
      transfer_id, reason
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

      {/* 전체 요청 목록 */}
      <table className="approve-table">
        <thead>
          <tr>
            <th>신청자</th>
            <th>출금계좌</th>
            <th>총금액</th>
            <th>이체건수</th>
            <th>요청일</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {list.map(item => (
            <tr key={item.transfer_id}>
              <td>{item.customer_id}</td>
              <td>{item.out_account_number}</td>
              <td>{item.total_amount?.toLocaleString()}원</td>
              <td>{item.count}건</td>
              <td>{item.request_date ? new Date(item.request_date).toLocaleString() : '-'}</td>
              <td>{item.status}</td>
              <td>
                <button onClick={() => fetchDetails(item.transfer_id)} className="btn-detail">상세</button>
                <button onClick={() => handleApprove(item.transfer_id)} className="btn-approve" disabled={loading}>승인</button>
                <button onClick={() => handleReject(item.transfer_id)} className="btn-reject" disabled={loading}>반려</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 선택된 요청의 세부 이체건 */}
      {details.length > 0 && (
        <div className="detail-section">
          <h4>이체 상세 내역</h4>
          <table className="detail-table">
            <thead>
              <tr>
                <th>입금계좌</th>
                <th>수취인</th>
                <th>금액</th>
                <th>메모</th>
              </tr>
            </thead>
            <tbody>
              {details.map((item, index) => (
                <tr key={index}>
                  <td>{item.in_account_number}</td>
                  <td>{item.in_name}</td>
                  <td>{item.amount?.toLocaleString()}원</td>
                  <td>{item.memo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {loading && <div className="loading">처리 중...</div>} {/* 로딩 상태 표시 */}
    </div>
  );
}

export default TransMultiApprove;
