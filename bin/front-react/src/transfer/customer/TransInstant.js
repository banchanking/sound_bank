import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../Css/transfer/TransInstant.css'; 

function TransInstant() {
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

  const [accounts, setAccounts] = useState([]); // 출금 계좌 목록

  // 컴포넌트 처음 실행 시 로그인 ID와 계좌목록 불러오기
  useEffect(() => {
    const id = localStorage.getItem('customer_id');
    if (!id) {
      alert('로그인이 필요합니다.');
      return;
    }
    setForm(prev => ({ ...prev, customer_id: id }));

    // 계좌 목록 불러오기
    axios.get(`http://15.165.57.30:8081/api/accounts/allAccount/${id}`)
      .then(res => {
        const raw = res.data;
        let list = [];
        if (typeof raw === 'object') list = Object.values(raw).flat();
        setAccounts(list);
      })
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 이체 요청 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://15.165.57.30:8081/api/transInstant/send', form);
      if (res.data === '비밀번호 오류') {
        alert('비밀번호가 일치하지 않습니다.');
      } else if (res.data === '이체 완료') {
        alert('이체가 정상적으로 완료되었습니다.');
      } else {
        alert('처리 결과: ' + res.data); // 혹시 다른 메시지가 있을 경우 대비
      }
    } catch (err) {
      alert('요청 실패');
      console.error(err);
    }
  };

  return (
    <div className="instant-wrap">
      <h2>실시간 이체</h2>
      <form onSubmit={handleSubmit}>
        {/* 출금 계좌 선택 드롭다운 */}
        <label>출금 계좌</label>
        <select name="out_account_number" value={form.out_account_number} onChange={handleChange} required>
          <option value="">출금 계좌 선택</option>
          {accounts.map(acc => (
            <option key={acc.account_number || acc.dat_account_num} value={acc.account_number || acc.dat_account_num}>
              {acc.account_number || acc.dat_account_num} ({acc.account_type || acc.dat_account_type})
            </option>
          ))}
        </select>

            {/* 입금 계좌번호 입력 */}
            <input
              type="text"
              name="in_account_number"
              placeholder="입금 계좌"
              value={form.in_account_number}
              onChange={handleChange}
              required
            />

            {/* 받는 사람 이름 입력 */}
            <input
              type="text"
              name="in_name"
              placeholder="받는 사람"
              value={form.in_name}
              onChange={handleChange}
              required
            />

            {/* 이체 금액 입력 */}
            <input
              type="number"
              name="amount"
              placeholder="금액"
              value={form.amount}
              onChange={handleChange}
              required
            />

            {/* 메모 입력 (선택사항) */}
            <input
              type="text"
              name="memo"
              placeholder="메모"
              value={form.memo}
              onChange={handleChange}
            />

            {/* 비밀번호 입력 */}
            <input
              type="password"
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              required
            />

        <button type="submit">이체하기</button>
      </form>
    </div>
  );
}

export default TransInstant;