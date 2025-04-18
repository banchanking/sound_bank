import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import '../../Css/transfer/TransInstant.css';
import { getCustomerID } from "../../jwt/AxiosToken";
import Sidebar from './Sidebar';
import { useNavigate } from 'react-router-dom';

function TransInstant() {
  const navigate = useNavigate();

  // 폼 상태 (서버 전송용)
  const [form, setForm] = useState({
    customer_id: '',
    out_account_number: '',
    in_account_number: '',
    in_name: '',
    transfer_type: '실시간',
    amount: '',     // 숫자만 저장
    memo: '',
    password: ''
  });

  // 표시용 금액 상태 (쉼표 포함)
  const [displayAmount, setDisplayAmount] = useState('');

  // 계좌 목록
  const [accounts, setAccounts] = useState([]);

  // 이체 모달창 표시 여부
  const [showModal, setShowModal] = useState(false);

  // 로그인 확인 및 계좌 목록 로딩
  useEffect(() => {
    const id = getCustomerID();
    const token = localStorage.getItem("auth_token");

    if (!id) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    setForm(prev => ({ ...prev, customer_id: id }));

    RefreshToken.get(`http://localhost:8081/api/accounts/allAccount/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : Object.values(raw).flat();
        setAccounts(list);
      })
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  // 입력 처리 함수 (금액만 별도 처리)
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'amount') {
      // 숫자와 소수점만 허용
      let raw = value.replace(/[^\d.]/g, '');
  
      // 소수점 하나만 허용
      raw = raw.replace(/^(\d*\.?\d*).*$/, '$1');
  
      if (!raw) {
        setDisplayAmount('');
        setForm(prev => ({ ...prev, amount: '' }));
        return;
      }
  
      // 쉼표 포함 포맷 (정수부만 처리)
      const [intPart, decimalPart] = raw.split('.');
      const formatted = Number(intPart).toLocaleString() + (decimalPart !== undefined ? '.' + decimalPart : '');
  
      setDisplayAmount(formatted);
      setForm(prev => ({ ...prev, amount: raw }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // 이체 실행 함수
  const confirmTransfer = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate('/Login'); 
      return;
    }

    RefreshToken.post("http://localhost:8081/api/transInstant/send", form, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data === "비밀번호 오류") {
          alert("비밀번호가 일치하지 않습니다.");
        } else if (res.data === "이체 완료") {
          alert("이체가 정상적으로 완료되었습니다.");
          setForm({
            customer_id: form.customer_id,
            out_account_number: '',
            in_account_number: '',
            in_name: '',
            transfer_type: '실시간',
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
      {/* 사이드바 */}
      <Sidebar />

      {/* 이체 폼 */}
      <div className="instant-wrap" style={{ flex: 1, padding: '20px' }}>
        <h2>실시간 이체</h2>
        <form onSubmit={(e) => { e.preventDefault(); setShowModal(true); }}>
          <label>출금 계좌</label>
          <select
            name="out_account_number"
            value={form.out_account_number}
            onChange={handleChange}
            required
            style={{ marginBottom: '15px' }}
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

          <input type="text" name="in_account_number" placeholder="입금 계좌" value={form.in_account_number} onChange={handleChange} required />
          <input type="text" name="in_name" placeholder="받는 사람" value={form.in_name} onChange={handleChange} required />

          {/* 쉼표 표시 금액 입력 */}
          <input
            type="text"
            name="amount"
            placeholder="금액"
            value={displayAmount}
            onChange={handleChange}
            required
          />

          <input type="text" name="memo" placeholder="메모" value={form.memo} onChange={handleChange} />
          <input type="password" name="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required />

          <button type="submit">이체하기</button>
        </form>

        {/* 이체 확인 모달 */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>이체 확인</h3>
              <div className="modal-details">
                <p><b>이체금액:</b> {Number(form.amount).toLocaleString()}원</p>
                <p><b>출금계좌:</b> {form.out_account_number}</p>
                <p><b>입금계좌:</b> {form.in_account_number}</p>
                <p><b>받는사람:</b> {form.in_name}</p>
                <p><b>메모:</b> {form.memo || '-'}</p>
              </div>
              <div style={{ marginTop: '20px', marginBottom: '10px', fontWeight: 'bold' }}>
                정말 이체하시겠습니까?
              </div>
              <div className="modal-buttons">
                <button onClick={confirmTransfer}>이체하기</button>
                <button onClick={() => setShowModal(false)}>취소</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransInstant;
