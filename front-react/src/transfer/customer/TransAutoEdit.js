// TransAutoEdit.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../../Css/transfer/TransAutoEdit.css';
import { getCustomerID } from '../../jwt/AxiosToken';

function TransAutoEdit() {
  const [list, setList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const id = getCustomerID();
    const t = localStorage.getItem('auth_token');
    if (!id || !t) {
      alert('로그인이 필요합니다.');
      return;
    }
    setToken(t);

    axios.get(`http://localhost:8081/api/transAuto/list/${id}`, {
      headers: { Authorization: `Bearer ${t}` }
    })
    .then(res => setList(res.data))
    .catch(err => {
      console.error('조회 실패:', err);
      alert('자동이체 목록 조회 실패');
    });
  }, []);

  const change = (e) => {
    const { name, value } = e.target;
    setEditItem(prev => ({ ...prev, [name]: value }));
  };

  const update = () => {
    axios.put('http://localhost:8081/api/transAuto/update', editItem, {
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

  const handleDelete = (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      axios.delete(`http://localhost:8081/api/transAuto/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        alert('삭제되었습니다');
        setList(prev => prev.filter(item => item.transfer_id !== id));
      })
      .catch(err => {
        console.error('삭제 실패:', err);
        alert('삭제 실패');
      });
    }
  };

  const remove = () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    axios.delete(`http://localhost:8081/api/transAuto/delete/${editItem.transfer_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert('삭제 완료');
      setEditItem(null);
      window.location.reload();
    })
    .catch(err => {
      console.error('삭제 실패:', err);
      alert('삭제 실패');
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '600px' }}>
      <Sidebar />
      <div className="auto-edit-wrap">
        <h2>자동이체 관리</h2>

        <table className="edit-table">
          <thead>
            <tr>
              <th>출금계좌</th>
              <th>입금계좌</th>
              <th>수취인</th>
              <th>이체금액</th>
              <th>이체방식</th>
              <th>메모</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => (
              <tr key={item.transfer_id}>
                <td>{item.out_account_number}</td>
                <td>{item.in_account_number}</td>
                <td>{item.in_name}</td>
                <td>{item.amount}원</td>
                <td>
                  {item.schedule_mode === 'day'
                    ? `매주 ${['월','화','수','목','금','토','일'][item.schedule_day - 1]}요일 ${item.schedule_time}분   이체실행`
                    : `매월 ${item.schedule_month_day}일 ${item.schedule_time}분 이체실행`}
                </td>
                <td>{item.memo}</td>
                <td>
                    <button className="edit-btn" onClick={() => setEditItem(item)}>수정</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.transfer_id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {editItem && (
          <div className="edit-modal-overlay">
            <div className="edit-modal-box">
              <h3>자동이체 수정</h3>

              <label>이체금액</label>
              <input className="input" type="number" name="amount" value={editItem.amount} onChange={change} /> 원

              <label>이체방식</label>
              <select name="schedule_mode" value={editItem.schedule_mode} onChange={change}>
                <option value="day">요일 반복</option>
                <option value="monthly">매월 지정일</option>
              </select>

              {editItem.schedule_mode === 'day' && (
                <>
                  <label>매주</label>
                  <select name="schedule_day" value={editItem.schedule_day} onChange={change}>
                    <option value="1">월요일</option>
                    <option value="2">화요일</option>
                    <option value="3">수요일</option>
                    <option value="4">목요일</option>
                    <option value="5">금요일</option>
                    <option value="6">토요일</option>
                    <option value="7">일요일</option>
                  </select>
                </>
              )}

              {editItem.schedule_mode === 'monthly' && (
                <>
                 매월 <input className="short-input" type="number" name="schedule_month_day" value={editItem.schedule_month_day || ''} onChange={change} /> 일
                </>
              )}

              <label>이체시간</label>
              <input className="input" type="time" name="schedule_time" value={editItem.schedule_time} onChange={change} />

              <label>이체메모</label>
              <input type="text" name="memo" value={editItem.memo || ''} onChange={change} />

              <div className="modal-buttons">
                <button onClick={update}>수정하기</button>
                <button onClick={() => setEditItem(null)} style={{ backgroundColor: '#bbb' }}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransAutoEdit;
