import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../Css/transfer/TransAuto.css';
import Sidebar from './Sidebar'; // ✅ 사이드바 추가
import { getCustomerID } from "../../jwt/AxiosToken";

function TransAuto() {
  // 입력값 상태 관리
  const [form, setForm] = useState({
    customer_id: '',             // 사용자 ID
    out_account_number: '',      // 출금 계좌번호
    in_account_number: '',       // 입금 계좌번호
    in_name: '',                 // 받는 사람 이름
    amount: '',                  // 이체 금액
    memo: '',                    // 메모 (선택사항)
    schedule_mode: 'day',        // 반복 모드(day/monthly)
    schedule_day: '1',           // 요일 (1~7: 월~일)
    schedule_month_day: '',      // 매월 며칠
    schedule_time: '09:00',      // 이체 시간
    password: ''                 // 계좌 비밀번호
  });

  const [accounts, setAccounts] = useState([]);         // 계좌 목록
  const [agree, setAgree] = useState(false);            // 약관 동의 여부
  const [showTerms, setShowTerms] = useState(false);    // 약관 모달 표시 여부

  // 페이지 처음 진입 시 계좌목록 가져오기
  useEffect(() => {
    const id = getCustomerID();   // AxiosToken파일내 아이디 함수 활용
    const token = localStorage.getItem("auth_token"); // JWT 토큰 가져오기

    if (!id) {
      alert('로그인이 필요합니다');
      return;
    }
    setForm(prev => ({ ...prev, customer_id: id }));

    axios.get(`http://localhost:8081/api/accounts/allAccount/${id}`,{
      headers: {
        Authorization: `Bearer ${token}`
          }      
    })
      .then(res => {
        const raw = res.data;
        let list = [];
        if (typeof raw === 'object') list = Object.values(raw).flat();
        setAccounts(list);
      })
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  // 입력값 변경 시 상태 업데이트
  const change = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const token = localStorage.getItem("auth_token"); // JWT 토큰 가져오기
  // 등록 버튼 클릭 시 실행
  const send = async (e) => {
    e.preventDefault();
  
    if (!agree) {
      alert('약관 동의가 필요합니다');
      return;
    }
  
    try {
      // 실제 서버 전송
      const res = await axios.post('http://localhost:8081/api/transAuto/add', form,{
        headers: {
          Authorization: `Bearer ${token}`
            }
      });
  
      // 서버 응답 처리
      if (res.data === '비밀번호 오류') {
        alert('비밀번호가 틀렸습니다.');
      } else {
        alert('자동이체 등록이 완료되었습니다.');
      }
    } catch (err) {
      console.error('등록 오류:', err);
      alert('서버 오류로 등록에 실패했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
        <Sidebar /> {/* 사이드바 추가 */}

    <div className="auto-add-wrap">
        <div style={{ flexGrow: 1, paddingLeft: '20px' }}>
          <h2>자동이체 등록</h2>
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

            {/* 받는 사람 정보 입력 */}
            <input type="text" name="in_account_number" placeholder="받는 사람 계좌번호" value={form.in_account_number} onChange={change} required />
            <input type="text" name="in_name" placeholder="받는 사람 이름" value={form.in_name} onChange={change} required />
            <input type="number" name="amount" placeholder="이체 금액" value={form.amount} onChange={change} required />
            <input type="text" name="memo" placeholder="메모 (선택사항)" value={form.memo} onChange={change} />

            {/* 이체 방식 선택 (요일 반복 / 매월 며칠) */}
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

            {/* 이체 시간 선택 */}
            <label>이체 시간</label>
            <input type="time" name="schedule_time" value={form.schedule_time} onChange={change} required />

            {/* 계좌 비밀번호 입력 */}
            <input type="password" name="password" placeholder="계좌 비밀번호" value={form.password} onChange={change} required />

            {/* 약관 동의 */}
            <div className="terms-wrap">
              <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
              <label>자동이체 약관에 동의합니다.</label>
              <button type="button" onClick={() => setShowTerms(true)} style={{ fontSize: '12px', marginLeft: '8px' }}>
                [보기]
              </button>
            </div>

            {/* 약관 모달창 */}
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
