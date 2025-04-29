import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import styles from '../../Css/transfer/TransAuto.module.css';
import Sidebar from './Sidebar';
import { getCustomerID } from '../../jwt/AxiosToken';
import { useNavigate } from 'react-router-dom';

function TransAuto() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_id: '',
    out_account_number: '',
    in_account_number: '',
    in_name: '',
    amount: '',
    memo: '',
    schedule_mode: 'day',
    schedule_day: '1',
    schedule_month_day: '',
    schedule_time: '09:00',
    password: ''
  });

  const [displayAmount, setDisplayAmount] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const id = getCustomerID();
    if (!id) {
      const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
      if (goLogin) {
        navigate("/login");
      } else {
        navigate("/");
      }
      return;
    }
    setForm(prev => ({ ...prev, customer_id: id }));
    RefreshToken.get(`/accounts/allAccount/${id}`)
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : Object.values(res.data).flat();
        setAccounts(list);
      })
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, [navigate]);

  const getAccountTypeLabel = (type) => {
    if (type === 'CHECKING') return '입출금';
    if (type === 'DEPOSIT') return '예금';
    if (type === 'SAVINGS') return '적금';
    return type || '알수없음';
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const raw = value.replace(/[^0-9]/g, '');
      setDisplayAmount(raw ? Number(raw).toLocaleString('ko-KR') : '');
      setForm(prev => ({ ...prev, amount: raw }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const change = e => {
    const { name, value } = e.target;

    // 출금계좌 선택 시 예/적금이면 경고 후 이동
    if (name === 'out_account_number') {
      const selected = accounts.find(acc => acc.account_number === value);
      const type = selected?.account_type;
      if (type === 'DEPOSIT' || type === 'SAVINGS') {
        alert('예/적금 계좌이체는 예/적금 메뉴에서 진행 가능합니다.');
        navigate('/depositWithdrawal');
        return;
      }
    }

    if (name === 'schedule_mode') {
      setForm(prev => ({
        ...prev,
        [name]: value,
        schedule_day: value === 'day' ? '1' : '',
        schedule_month_day: value === 'monthly' ? '' : ''
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const send = async e => {
    e.preventDefault();
    if (!agree) {
      alert('약관 동의가 필요합니다');
      return;
    }

    try {
      const res = await RefreshToken.post('/transAuto/add', form);
      if (res.data === '비밀번호 오류') {
        alert('비밀번호가 틀렸습니다.');
      } else {
        alert('자동이체 등록이 완료되었습니다.');
        navigate('/transAutoEdit');
      }
    } catch (err) {
      console.error('등록 오류:', err);
      alert('서버 오류로 등록에 실패했습니다.');
    }
  };

  const selectedAccount = accounts.find(acc => acc.account_number === form.out_account_number);

  return (
    <div className={styles['auto-page']}>
      <Sidebar />
      <div className={styles['auto-wrapper']}>
        <h2 className={`${styles['auto-title']} ${styles['auto-fadeInUp']}`}>자동이체 등록</h2>
        <form className={styles['auto-form']} onSubmit={send}>
          <select
            name="out_account_number"
            value={form.out_account_number}
            onChange={change}
            required
            className={styles['auto-select']}
          >
            <option value="">출금 계좌 선택</option>
            {accounts.map(acc => (
              <option key={acc.account_number} value={acc.account_number}>
                {acc.account_number} ({getAccountTypeLabel(acc.account_type)})
              </option>
            ))}
          </select>

          {selectedAccount && (
            <div style={{ marginLeft: '10px', marginTop: '-8px', marginBottom: '1px', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
              잔액: {Number(
                selectedAccount.balance ?? selectedAccount.account_balance ?? 0
              ).toLocaleString('ko-KR')} 원
            </div>
          )}

          <input
            name="in_account_number"
            placeholder="받는 사람 계좌번호"
            value={form.in_account_number}
            onChange={change}
            required
            className={styles['auto-input']}
          />
          <input
            name="in_name"
            placeholder="받는 사람 이름"
            value={form.in_name}
            onChange={change}
            required
            className={styles['auto-input']}
          />
          <input
            name="amount"
            placeholder="금액"
            value={displayAmount}
            onChange={handleChange}
            required
            className={styles['auto-input']}
          />
          <input
            name="memo"
            placeholder="메모 (선택사항)"
            value={form.memo}
            onChange={change}
            className={styles['auto-input']}
          />

          <div className={styles['auto-radioRow']}>
            <label>
              <input
                type="radio"
                name="schedule_mode"
                value="day"
                checked={form.schedule_mode === 'day'}
                onChange={change}
              /> 요일 반복
            </label>
            <label>
              <input
                type="radio"
                name="schedule_mode"
                value="monthly"
                checked={form.schedule_mode === 'monthly'}
                onChange={change}
              /> 매월 지정일
            </label>
          </div>

          {form.schedule_mode === 'day' ? (
            <select
              name="schedule_day"
              value={form.schedule_day}
              onChange={change}
              required
              className={styles['auto-select']}
            >
              <option value="1">월요일</option>
              <option value="2">화요일</option>
              <option value="3">수요일</option>
              <option value="4">목요일</option>
              <option value="5">금요일</option>
              <option value="6">토요일</option>
              <option value="7">일요일</option>
            </select>
          ) : (
            <div className={styles['auto-monthly']}>
              <span>매월</span>
              <input
                type="number"
                name="schedule_month_day"
                value={form.schedule_month_day}
                onChange={change}
                min="1"
                max="31"
                required
                className={styles['auto-input']}
              />
              <span>일</span>
            </div>
          )}

          <input
            type="time"
            name="schedule_time"
            value={form.schedule_time}
            onChange={change}
            required
            className={styles['auto-input']}
          />
          <input
            type="password"
            name="password"
            placeholder="계좌 비밀번호"
            value={form.password}
            onChange={change}
            required
            className={styles['auto-input']}
          />

          <div className={styles['auto-terms']}>
            <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
            <label>자동이체 약관에 동의합니다.</label>
            <button type="button" onClick={() => setShowTerms(true)}>보기</button>
          </div>

          {showTerms && (
            <div className={styles['auto-modalOverlay']}>
              <div className={styles['auto-modalBox']}>
                <h3>자동이체 약관</h3>
                <p>
                  - 자동이체는 사용자가 등록한 일정에 따라 이체됩니다.<br />
                  - 이체 실패 시 재시도는 자동으로 이루어지지 않습니다.<br />
                  - 등록된 이체는 언제든 수정/삭제 가능합니다.<br />
                </p>
                <button onClick={() => setShowTerms(false)}>닫기</button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={styles['auto-submitButton']}
            disabled={!agree}
          >
            등록
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransAuto;
