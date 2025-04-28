import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../Css/transfer/TransAuto.css';

function TransAuto() {
  const [form, setForm] = useState({
    customer_id: '',
    out_account_number: '',
    in_account_number: '',
    in_name: '',
    amount: '',
    memo: '',
    schedule_day: '1',        // 월요일 기본값
    schedule_time: '09:00',   // 기본값 09:00
    password: ''
  });

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const id = localStorage.getItem('customer_id');
    if (!id) {
      alert('로그인이 필요합니다.');
      return;
    }
    setForm(prev => ({ ...prev, customer_id: id }));

    axios.get(`http://15.165.57.30:8081/api/accounts/allAccount/${id}`)
      .then(res => {
        const raw = res.data;
        let list = [];
        if (typeof raw === 'object') list = Object.values(raw).flat();
        setAccounts(list);
      })
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://15.165.57.30:8081/api/transAuto/apply', form);
      alert(res.data);
    } catch (err) {
      alert('요청 실패');
      console.error(err);
    }
  };

  return (
    <div className="auto-wrap">
      <h2>자동이체 신청</h2>
      <form onSubmit={handleSubmit}>
        <label>출금 계좌</label>
        <select name="out_account_number" value={form.out_account_number} onChange={handleChange} required>
          <option value="">출금 계좌 선택</option>
          {accounts.map(acc => (
            <option key={acc.account_number} value={acc.account_number}>
              {acc.account_number} ({acc.account_type})
            </option>
          ))}
        </select>

        <input type="text" name="in_account_number" placeholder="입금 계좌" value={form.in_account_number} onChange={handleChange} required />
        <input type="text" name="in_name" placeholder="받는 사람" value={form.in_name} onChange={handleChange} required />
        <input type="number" name="amount" placeholder="금액" value={form.amount} onChange={handleChange} required />
        <input type="text" name="memo" placeholder="메모" value={form.memo} onChange={handleChange} />

        <label>이체 요일</label>
        <select name="schedule_day" value={form.schedule_day} onChange={handleChange} required>
          <option value="1">월요일</option>
          <option value="2">화요일</option>
          <option value="3">수요일</option>
          <option value="4">목요일</option>
          <option value="5">금요일</option>
          <option value="6">토요일</option>
          <option value="7">일요일</option>
        </select>

        <label>이체 시간</label>
        <input
          type="time"
          name="schedule_time"
          value={form.schedule_time}
          onChange={handleChange}
          required
        />

        <input type="password" name="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required />

        <button type="submit">신청하기</button>
      </form>
    </div>
  );
}

export default TransAuto;
