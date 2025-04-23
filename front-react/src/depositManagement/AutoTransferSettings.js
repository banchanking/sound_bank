import React, { useEffect, useState } from 'react';
import RefreshToken from '../jwt/RefreshToken';
import '../Css/Deposit/AutoTransferSettings.css';
import { getCustomerID } from "../jwt/AxiosToken";

function AutoTransferSettings() {
  const [form, setForm] = useState({
    customer_id: '',
    out_account_number: '',
    in_account_number: '',
    amount: '',
    memo: '',
    schedule_mode: 'day',
    schedule_day: '1',
    schedule_month_day: '',
    schedule_time: '09:00',
    password: '',
    sender_name: '' // 보내는 사람 이름 추가
  });

  const [accounts, setAccounts] = useState([]);
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const id = getCustomerID();
    if (!id) {
      alert('로그인이 필요합니다');
      return;
    }
    setForm(prev => ({ ...prev, customer_id: id }));

    RefreshToken.get(`http://localhost:8081/api/accounts/allAccount/${id}`)
      .then(res => {
        const raw = res.data;
        let list = [];
        if (typeof raw === 'object') list = Object.values(raw).flat();
        setAccounts(list);
      })
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  const change = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const selectAmount = (amount) => {
    setForm(prev => ({ ...prev, amount: amount.toString() }));
  };

  const send = async (e) => {
    e.preventDefault();

    if (!agree) {
      alert('약관 동의가 필요합니다');
      return;
    }

    try {
      const res = await RefreshToken.post('http://localhost:8081/api/deposit/autoTransfer', form);

      if (res.data === '비밀번호 오류') {
        alert('비밀번호가 틀렸습니다.');
      } else {
        alert('예금 자동이체 등록이 완료되었습니다.');
      }
    } catch (err) {
      console.error('등록 오류:', err);
      alert('서버 오류로 등록에 실패했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div className="auto-transfer-wrap">
        <div style={{ flexGrow: 1, paddingLeft: '20px' }}>
          <h2>예금 자동이체 설정</h2>
          <form onSubmit={send}>
            <label>출금 계좌</label>
            <select name="out_account_number" value={form.out_account_number} onChange={change} required>
              <option value="">출금 계좌 선택</option>
              {accounts.map(acc => (
                <option key={acc.account_number} value={acc.account_number}>
                  {acc.account_number} ({acc.account_type})
                </option>
              ))}
            </select>

            <input
              type="password"
              name="password"
              placeholder="계좌 비밀번호"
              value={form.password}
              onChange={change}
              required
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="number"
                name="amount"
                placeholder="이체 금액"
                value={form.amount}
                onChange={change}
                required
                style={{ flex: 1 }}
              />
              <span>원</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1000000, 500000, 100000, 50000, 30000, 10000].map(amount => (
                  <button
                    type="button"
                    key={amount}
                    onClick={() => selectAmount(amount)}
                    style={{
                      padding: '5px 10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: '#f1f1f1'
                    }}
                  >
                    {amount / 10000}만
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              name="sender_name"
              placeholder="보내는 사람 이름"
              value={form.sender_name}
              onChange={change}
              required
            />

            <input type="text" name="memo" placeholder="메모 (선택사항)" value={form.memo} onChange={change} />

            <label>이체 방식</label>
            <div className="schedule-mode">
              <label>
                <input type="radio" name="schedule_mode" value="day" checked={form.schedule_mode === 'day'} onChange={change} />
                요일 반복
              </label>
              <label>
                <input type="radio" name="schedule_mode" value="monthly" checked={form.schedule_mode === 'monthly'} onChange={change} />
                매월 지정일
              </label>
            </div>

            {form.schedule_mode === 'day' && (
              <>
                <label>매주</label>
                <select name="schedule_day" value={form.schedule_day} onChange={change} required>
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

            {form.schedule_mode === 'monthly' && (
              <div className="monthly-day-group">
                <label>매월 지정일 설정</label>
                <div className="inline-day">
                  <span>매월</span>
                  <input
                    className="month-day"
                    type="number"
                    name="schedule_month_day"
                    min="1"
                    max="31"
                    placeholder="5"
                    value={form.schedule_month_day}
                    onChange={change}
                    required
                  />
                  <span>일</span>
                </div>
              </div>
            )}

            <label>이체 시간</label>
            <input type="time" name="schedule_time" value={form.schedule_time} onChange={change} required />

            <div className="terms-wrap">
              <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
              <label>예금 자동이체 약관에 동의합니다.</label>
              <button type="button" onClick={() => setShowTerms(true)} style={{ fontSize: '12px', marginLeft: '8px' }}>
                [보기]
              </button>
            </div>

            {showTerms && (
              <div className="auto-modal-overlay">
                <div className="auto-modal-box">
                  <h3>예금 자동이체 약관</h3>
                  <div className="auto-modal-content">
                    <p>
                      - 자동이체는 사용자가 등록한 일정에 따라 이체됩니다.<br />
                      - 이체 실패 시 재시도는 자동으로 이루어지지 않습니다.<br />
                      - 이체 완료 내역은 마이페이지에서 확인할 수 있습니다.<br />
                      - 등록된 이체는 언제든 수정/삭제 가능합니다.<br />
                    </p>
                  </div>
                  <button onClick={() => setShowTerms(false)}>닫기</button>
                </div>
              </div>
            )}

            <button type="submit" disabled={!agree}>등록</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AutoTransferSettings;