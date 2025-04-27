import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import Sidebar from './Sidebar';
import styles from '../../Css/transfer/TransMultiEdit.module.css';
import { getCustomerID } from '../../jwt/AxiosToken';

function TransMultiEdit() {
  const [list, setList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const customer_id = getCustomerID();
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    if (!customer_id || !token) {
      alert('로그인이 필요합니다');
      return;
    }

    RefreshToken.get(`/transMulti/list/${customer_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setList(res.data))
      .catch(err => {
        console.error('목록 조회 실패:', err);
        alert('다건이체 내역 조회 실패');
      });
  }, []);

  const deleteRow = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    RefreshToken.delete(`/transMulti/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert('삭제 완료');
        setList(list.filter(item => item.transfer_id !== id));
        window.location.reload();
      })
      .catch(err => {
        console.error('삭제 실패:', err);
        alert('삭제 실패');
      });
  };

  const change = (e) => {
    const { name, value } = e.target;
    setEditItem(prev => ({ ...prev, [name]: value }));
  };

  const update = () => {
    RefreshToken.put('/transMulti/update', editItem, {
      headers: { Authorization: `Bearer ${token}` }
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
    <div style={{ display: 'flex', minHeight: '560px' }}>
      <Sidebar />

      <div className={styles["multiEdit-wrapper"]}>
        <h2 className={styles["multiEdit-title"]}>다건이체 관리</h2>

        <table className={styles["multiEdit-table"]}>
          <thead>
            <tr>
              <th>요청일</th>
              <th>출금계좌</th>
              <th>입금계좌</th>
              <th>수취인</th>
              <th>금액</th>
              <th>메모</th>
              <th>승인상태</th>
              <th>이체일</th>
              <th>거절사유</th>
              <th>승인전 관리</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => (
              <tr key={item.transfer_id}>
                <td>{item.request_date ? new Date(item.request_date).toLocaleString() : '-'}</td>
                <td>{item.out_account_number || '-'}</td>
                <td>{item.in_account_number || '-'}</td>
                <td>{item.in_name || '-'}</td>
                <td>{item.amount?.toLocaleString('ko-KR')}원</td>
                <td>{item.memo || '-'}</td>
                <td>{item.status || '대기'}</td>
                <td>
                  {item.status === '승인' && item.transfer_date
                    ? new Date(item.transfer_date).toLocaleString()
                    : '-'}
                </td>
                <td>{item.status === '거절' ? (item.reject_reason || '-') : '-'}</td>
                <td>
                  {item.status === '대기' ? (
                    <div className={styles["multiEdit-buttonGroup"]}>
                      <button onClick={() => setEditItem(item)} className={styles["multiEdit-btnBlue"]}>수정</button>
                      <button onClick={() => deleteRow(item.transfer_id)} className={styles["multiEdit-btnRed"]}>삭제</button>
                    </div>
                  ) : (
                    item.approval_date ? new Date(item.approval_date).toLocaleString() : '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editItem && (
          <div className={styles["multiEdit-modalOverlay"]}>
            <div className={styles["multiEdit-modalBox"]}>
              <h3>다건이체 수정</h3>
              <label>이체 금액</label>
              <input type="number" name="amount" value={editItem.amount} onChange={change} />
              <label>메모</label>
              <input type="text" name="memo" value={editItem.memo || ''} onChange={change} />

              <div className={styles["multiEdit-modalButtons"]}>
                <button onClick={update} className={styles["multiEdit-modalBtn"]}>수정</button>
                <button onClick={() => setEditItem(null)} className={styles["multiEdit-modalBtn"]}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransMultiEdit;
