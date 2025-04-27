// TransInstant.js

import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import styles from '../../Css/transfer/TransInstant.module.css';
import { getCustomerID } from "../../jwt/AxiosToken";
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

function TransInstant() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_id: '',
    out_account_number: '',
    in_account_number: '',
    in_name: '',
    transfer_type: '실시간',
    amount: '',
    memo: '',
    password: ''
  });
  const [displayAmount, setDisplayAmount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const id = getCustomerID();
    const token = localStorage.getItem("auth_token");
    if (!id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    setForm(prev => ({ ...prev, customer_id: id }));
    RefreshToken.get(`/accounts/allAccount/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : Object.values(res.data).flat();
        setAccounts(list);
      })
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, [navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const raw = value.replace(/[^\d.]/g, '');
      const [intPart] = raw.split('.');
      setDisplayAmount(raw ? Number(intPart).toLocaleString('ko-KR') : '');
      setForm(prev => ({ ...prev, amount: raw }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const confirmTransfer = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/login');
      return;
    }
    RefreshToken.post("/transInstant/send", form, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data === "비밀번호 오류") {
          alert("비밀번호가 일치하지 않습니다.");
        } else if (res.data === "이체 완료") {
          alert("이체가 정상적으로 완료되었습니다.");
          setForm({
            ...form,
            out_account_number: '',
            in_account_number: '',
            in_name: '',
            amount: '',
            memo: '',
            password: ''
          });
          setDisplayAmount('');
          navigate('/InquireTransfer');
        } else {
          alert("처리 결과: " + res.data);
        }
        setShowModal(false);
      })
      .catch(err => {
        console.error("이체 요청 실패:", err);
        alert("서버 요청 실패");
      });
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div className={styles['instant-wrapper']}>
        <h2 className={styles['instant-title']}>실시간 이체</h2>
        <form onSubmit={e => { e.preventDefault(); setShowModal(true); }}>
          <select
            name="out_account_number"
            value={form.out_account_number}
            onChange={handleChange}
            className={styles['instant-select']}
            required
          >
            <option value="">출금 계좌 선택</option>
            {accounts.map(acc => (
              <option
                key={acc.account_number || acc.dat_account_num}
                value={acc.account_number || acc.dat_account_num}
              >
                {acc.account_number || acc.dat_account_num} ({acc.account_type || acc.dat_account_type})
              </option>
            ))}
          </select>

          <input
            name="in_account_number"
            placeholder="입금 계좌"
            value={form.in_account_number}
            onChange={handleChange}
            className={styles['instant-input']}
            required
          />
          <input
            name="in_name"
            placeholder="받는 사람"
            value={form.in_name}
            onChange={handleChange}
            className={styles['instant-input']}
            required
          />
          <input
            name="amount"
            placeholder="금액"
            value={displayAmount}
            onChange={handleChange}
            className={styles['instant-input']}
            required
          />
          <input
            name="memo"
            placeholder="메모"
            value={form.memo}
            onChange={handleChange}
            className={styles['instant-input']}
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            className={styles['instant-input']}
            required
          />
          <button type="submit" className={styles['instant-button']}>
            이체하기
          </button>
        </form>

        {showModal && (
          <div className={styles['instant-modalOverlay']}>
            <div className={styles['instant-modalContent']}>
              <h3>이체 확인</h3>
              <div className={styles['instant-modalDetails']}>
                <p><b>이체금액:</b> {Number(form.amount).toLocaleString('ko-KR')} 원</p>
                <p><b>출금계좌:</b> {form.out_account_number}</p>
                <p><b>입금계좌:</b> {form.in_account_number}</p>
                <p><b>받는사람:</b> {form.in_name}</p>
                <p><b>메모:</b> {form.memo || '-'}</p>
              </div>
              <div className={styles['instant-modalButtons']}>
                <button className={styles['instant-modalButtons2']}onClick={confirmTransfer}>이체하기</button>
                <button className={styles['instant-modalButtons2']}onClick={() => setShowModal(false)}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransInstant;
