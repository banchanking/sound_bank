import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken';
import '../../Css/transfer/TransAuto.css';        
import Sidebar from './Sidebar';                  
import { getCustomerID } from "../../jwt/AxiosToken";
import { useNavigate } from 'react-router-dom';   

function TransAuto() {
  const navigate = useNavigate();

  // 상태: 폼 입력값
  const [form, setForm] = useState({
    customer_id: '',
    out_account_number: '',
    in_account_number: '',
    in_name: '',
    amount: '',               
    memo: '',
    schedule_mode: 'day',     // 'day' 또는 'monthly'
    schedule_day: '1',        // 요일 반복일 경우
    schedule_month_day: '',   // 매월 지정일일 경우
    schedule_time: '09:00',
    password: ''
  });

  // 상태: 표시용 금액 (쉼표 포함)
  const [displayAmount, setDisplayAmount] = useState('');

  // 상태: 계좌 리스트
  const [accounts, setAccounts] = useState([]);

  // 상태: 약관 동의 여부, 약관 팝업 표시 여부
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // 마운트 시: 로그인 확인 + 계좌목록 불러오기
  useEffect(() => {
    const id = getCustomerID();
    if (!id) {
      alert('로그인이 필요합니다');
      navigate('/login');
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

  // 일반 필드 변경 처리 함수
  const change = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 금액 입력 처리 (쉼표 표시 + 숫자만 저장)
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      const raw = value.replace(/[^0-9]/g, ''); // 숫자만 남기기
      const formatted = raw ? Number(raw).toLocaleString() : '';
      setDisplayAmount(formatted); // 입력창 표시용
      setForm(prev => ({ ...prev, amount: raw })); // 전송용
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // 자동이체 등록 처리
  const send = async (e) => {
    e.preventDefault();

    if (!agree) {
      alert('약관 동의가 필요합니다');
      return;
    }

    try {
      const res = await RefreshToken.post('http://localhost:8081/api/transAuto/add', form);

      if (res.data === '비밀번호 오류') {
        alert('비밀번호가 틀렸습니다.');
      } else {
        alert('자동이체 등록이 완료되었습니다.');
        navigate('/transAutoEdit'); // 자동이체 목록 페이지로 이동
      }
    } catch (err) {
      console.error('등록 오류:', err);
      alert('서버 오류로 등록에 실패했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />

      <div className="auto-add-wrap">
        <div style={{ flexGrow: 1, paddingLeft: '20px' }}>
          <h2>자동이체 등록</h2>

          {/* 등록 폼 */}
          <form onSubmit={send}>

            {/* 출금 계좌 선택 */}
            <label>출금 계좌</label>
            <select name="out_account_number" value={form.out_account_number} onChange={change} required>
              <option value="">출금 계좌 선택</option>
              {accounts.map(acc => (
                <option key={acc.account_number} value={acc.account_number}>
                  {acc.account_number} ({acc.account_type})
                </option>
              ))}
            </select>

            {/* 기본 입력 항목 */}
            <input type="text" name="in_account_number" placeholder="받는 사람 계좌번호" value={form.in_account_number} onChange={change} required />
            <input type="text" name="in_name" placeholder="받는 사람 이름" value={form.in_name} onChange={change} required />
            <input type="text" name="amount" placeholder="금액" value={displayAmount} onChange={handleChange} required />
            <input type="text" name="memo" placeholder="메모 (선택사항)" value={form.memo} onChange={change} />

            {/* 반복 방식 선택 */}
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

            {/* 요일 반복 선택 */}
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

            {/* 매월 지정일 선택 */}
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

            {/* 이체 시간, 비밀번호 입력 */}
            <label>이체 시간</label>
            <input type="time" name="schedule_time" value={form.schedule_time} onChange={change} required />
            <input type="password" name="password" placeholder="계좌 비밀번호" value={form.password} onChange={change} required />

            {/* 약관 동의 체크박스 + 보기 팝업 */}
            <div className="terms-wrap">
              <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
              <label>자동이체 약관에 동의합니다.</label>
              <button type="button" onClick={() => setShowTerms(true)} style={{ fontSize: '12px', marginLeft: '8px' }}>
                [보기]
              </button>
            </div>

            {/* 약관 모달 */}
            {showTerms && (
              <div className="auto-modal-overlay">
                <div className="auto-modal-box">
                  <h3>자동이체 약관</h3>
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

            {/* 등록 버튼 */}
            <button type="submit" disabled={!agree}>등록</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TransAuto;
