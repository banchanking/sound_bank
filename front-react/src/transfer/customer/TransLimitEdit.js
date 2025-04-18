import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import Sidebar from './Sidebar';
import { getCustomerID } from '../../jwt/AxiosToken';
import '../../Css/transfer/TransLimitEdit.css';

function TransLimitEdit() {
  const [list, setList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [displayLimit, setDisplayLimit] = useState('');

  const customer_id = getCustomerID();
  const token = localStorage.getItem('auth_token');

  // 이체한도 변경 신청 내역 조회
  useEffect(() => {
    if (!customer_id || !token) {
      alert('로그인이 필요합니다');
      return;
    }

    RefreshToken.get(`http://localhost:8081/api/transLimit/list/${customer_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setList(res.data))
      .catch(err => {
        console.error('조회 실패:', err);
        alert('이체한도 내역 조회 실패');
      });
  }, []);

  // 삭제
  const deleteRow = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    RefreshToken.delete(`http://localhost:8081/api/transLimit/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert('삭제 완료');
        setList(prev => prev.filter(item => item.transfer_id !== id));
      })
      .catch(err => {
        console.error('삭제 실패:', err);
        alert('삭제 실패');
      });
  };

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'requested_limit') {
      const raw = value.replace(/[^0-9]/g, '');
      const formatted = raw ? Number(raw).toLocaleString() : '';
      setEditItem(prev => ({ ...prev, requested_limit: raw }));
      setDisplayLimit(formatted);
    } else {
      setEditItem(prev => ({ ...prev, [name]: value }));
    }
  };

  // 수정 저장
  const handleUpdate = () => {
    RefreshToken.put('http://localhost:8081/api/transLimit/update', editItem, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert('수정 완료');
        setEditItem(null);
        window.location.reload();
      })
      .catch(err => {
        console.error('수정 실패:', err);
        alert('수정 실패');
      });
  };

  return (
    <div style={{ display: 'flex', minHeight: '600px' }}>
      <Sidebar />

      <div className="limit-edit-content">
        <h2>1일한도 변경 신청내역</h2>

        <table className="limit-table">
          <thead>
            <tr>
              <th>계좌번호</th>
              <th>신청한도</th>
              <th>신청일</th>
              <th>상태</th>
              <th>거절사유</th>
              <th>승인전 관리</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => (
              <tr key={item.transfer_id}>
                <td>{item.out_account_number}</td>
                <td>{Number(item.requested_limit).toLocaleString()}원</td>
                <td>{item.request_date ? new Date(item.request_date).toLocaleString() : '-'}</td>
                <td>{item.status || '대기'}</td>
                <td>{item.status === '거절' ? (item.reject_reason) : '-'}</td>
                <td>
                  {(!item.status || item.status.trim() === '대기') && (
                    <>
                      <button onClick={() => {
                        setEditItem(item);
                        setDisplayLimit(Number(item.requested_limit).toLocaleString());
                      }} className="btn-blue">수정</button>
                      <button onClick={() => deleteRow(item.transfer_id)} className="btn-red">삭제</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 수정 모달창 */}
        {editItem && (
          <div className="edit-modal-overlay">
            <div className="edit-modal-box">
              <h3>이체한도 수정</h3>
              <label>요청금액</label>
              <input
                type="text"
                name="requested_limit"
                value={displayLimit}
                onChange={handleChange}
              />
              <label>신청 사유</label>
              <textarea
                name="reason"
                value={editItem.reason || ''}
                onChange={handleChange}
              />
              <div className="modal-buttons">
                <button onClick={handleUpdate} className="btn-blue">수정하기</button>
                <button onClick={() => setEditItem(null)} className="btn-red">취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransLimitEdit;