import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import styles from '../../Css/transfer/TransAutoEdit.module.css';
import Sidebar from './Sidebar';
import { getCustomerID } from '../../jwt/AxiosToken';

function TransAutoEdit() {
  const [list, setList] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [displayAmount, setDisplayAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const id = getCustomerID();
    if (!id) {
      alert('로그인이 필요합니다.');
      return;
    }
    RefreshToken.get(`/transAuto/list/${id}`)
      .then(res => setList(res.data))
      .catch(err => {
        console.error('조회 실패:', err);
        alert('자동이체 목록 조회 실패');
      });
  }, []);

  const openEditModal = (item) => {
    setEditItem(item);
    const [intPart] = String(item.amount).split('.');
    setDisplayAmount(Number(intPart).toLocaleString('ko-KR'));
  };

  const change = (e) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const raw = value.replace(/[^\d.]/g, '');
      const [intPart] = raw.split('.');
      setDisplayAmount(raw ? Number(intPart).toLocaleString('ko-KR') : '');
      setEditItem(prev => ({ ...prev, amount: raw }));
    } else {
      setEditItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const update = () => {
    RefreshToken.put('/transAuto/update', editItem)
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
      RefreshToken.delete(`/transAuto/delete/${id}`)
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

  const totalPages = Math.ceil(list.length / itemsPerPage);
  const currentItems = list.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const pageGroup = Math.floor((currentPage - 1) / 10);
  const startPage = pageGroup * 10 + 1;
  const endPage = Math.min(startPage + 9, totalPages);

  return (
    <div className={styles['autoEdit-page']}>
      <Sidebar />
      <div className={styles['autoEdit-wrapper']}>
        <h2 className={styles['autoEdit-title']}>자동이체 관리</h2>

        <table className={styles['autoEdit-table']}>
          <thead>
            <tr>
              <th>출금계좌</th>
              <th>입금계좌</th>
              <th>수취인</th>
              <th>금액</th>
              <th>방식</th>
              <th>메모</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(item => (
              <tr key={item.transfer_id}>
                <td>{item.out_account_number}</td>
                <td>{item.in_account_number}</td>
                <td>{item.in_name}</td>
                <td>{Number(item.amount).toLocaleString()}원</td>
                <td>
                  {item.schedule_mode === 'day'
                    ? `매주 ${['월','화','수','목','금','토','일'][item.schedule_day - 1]}요일 ${item.schedule_time}`
                    : `매월 ${item.schedule_month_day}일 ${item.schedule_time}`}
                </td>
                <td>{item.memo}</td>
                <td>
                  <button
                    className={styles['autoEdit-editBtn']}
                    onClick={() => openEditModal(item)}
                  >수정</button>
                  <button
                    className={styles['autoEdit-deleteBtn']}
                    onClick={() => handleDelete(item.transfer_id)}
                  >삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className={styles.pageButtonArea}>
          {startPage > 1 && (
            <button
              className={styles.pageArrow}
              onClick={() => setCurrentPage(startPage - 1)}
            >
              &lt;
            </button>
          )}
          {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(num => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={currentPage === num ? styles.activePage : styles.pageButton}
            >
              {num}
            </button>
          ))}
          {endPage < totalPages && (
            <button
              className={styles.pageArrow}
              onClick={() => setCurrentPage(endPage + 1)}
            >
              &gt;
            </button>
          )}
        </div>

        {editItem && (
          <div className={styles['autoEdit-modalOverlay']}>
            <div className={styles['autoEdit-modalBox']}>
              <h3>자동이체 수정</h3>

              <label>이체금액</label>
              <input
                type="text"
                name="amount"
                value={displayAmount}
                onChange={change}
              />

              <label>이체방식</label>
              <select
                name="schedule_mode"
                value={editItem.schedule_mode}
                onChange={change}
              >
                <option value="day">요일 반복</option>
                <option value="monthly">매월 지정일</option>
              </select>

              {editItem.schedule_mode === 'day' ? (
                <>
                  <label>매주</label>
                  <select
                    name="schedule_day"
                    value={editItem.schedule_day}
                    onChange={change}
                  >
                    <option value="1">월요일</option>
                    <option value="2">화요일</option>
                    <option value="3">수요일</option>
                    <option value="4">목요일</option>
                    <option value="5">금요일</option>
                    <option value="6">토요일</option>
                    <option value="7">일요일</option>
                  </select>
                </>
              ) : (
                <div className={styles['autoEdit-monthDayWrap']}>
                  <label>매월</label>
                  <input
                    type="number"
                    name="schedule_month_day"
                    value={editItem.schedule_month_day || ''}
                    onChange={change}
                    className={styles['autoEdit-shortInput']}
                  />
                  <span>일</span>
                </div>
              )}

              <label>이체시간</label>
              <input
                type="time"
                name="schedule_time"
                value={editItem.schedule_time}
                onChange={change}
              />

              <label>메모</label>
              <input
                type="text"
                name="memo"
                value={editItem.memo || ''}
                onChange={change}
              />

              <div className={styles['autoEdit-modalButtons']}>
                <button onClick={update}>수정</button>
                <button onClick={() => setEditItem(null)}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransAutoEdit;