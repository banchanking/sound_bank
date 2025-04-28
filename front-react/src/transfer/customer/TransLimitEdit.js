import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import Sidebar from './Sidebar';
import { getCustomerID } from '../../jwt/AxiosToken';
import styles from '../../Css/transfer/TransLimitEdit.module.css';

function TransLimitEdit() {
  const [list, setList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [displayLimit, setDisplayLimit] = useState('');

  const customer_id = getCustomerID();
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (!customer_id || !token) {
      alert('로그인이 필요합니다');
      return;
    }
    RefreshToken.get(`/transLimit/list/${customer_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setList(res.data))
      .catch(err => {
        console.error('조회 실패:', err);
        alert('이체한도 내역 조회 실패');
      });
  }, []);

  const deleteRow = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    RefreshToken.delete(`/transLimit/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => setList(prev => prev.filter(item => item.transfer_id !== id)))
      .catch(err => {
        console.error('삭제 실패:', err);
        alert('삭제 실패');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'requested_limit') {
      const raw = value.replace(/[^0-9]/g, '');
      setEditItem(prev => ({ ...prev, requested_limit: raw }));
      setDisplayLimit(raw ? Number(raw).toLocaleString('ko-KR') : '');
    } else {
      setEditItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = () => {
    RefreshToken.put('/transLimit/update', editItem, {
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
      <div className={styles['limitEdit-limitEditContent']}>
        <h2>1일한도 변경 신청내역</h2>
        <table className={styles['limitEdit-limitTable']}>
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
                <td>{item.status === '거절' ? item.reject_reason : '-'}</td>
                <td>
                  {(!item.status || item.status.trim() === '대기') && (
                    <div className={styles['limitEdit-buttonGroup']}>
                      <button
                        onClick={() => {
                          setEditItem(item);
                          setDisplayLimit(Number(item.requested_limit).toLocaleString('ko-KR'));
                        }}
                        className={styles['limitEdit-btnBlue']}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => deleteRow(item.transfer_id)}
                        className={styles['limitEdit-btnRed']}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editItem && (
          <div className={styles['limitEdit-editModalOverlay']}>
            <div className={styles['limitEdit-editModalBox']}>
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
              <div className={styles['limitEdit-modalButtons']}>
                <button onClick={handleUpdate} className={styles['limitEdit-modalBtn']}>수정</button>
                <button onClick={() => setEditItem(null)} className={styles['limitEdit-modalBtn']}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransLimitEdit;
