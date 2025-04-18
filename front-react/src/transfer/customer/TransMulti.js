import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken'; 
import Sidebar from './Sidebar';
import '../../Css/transfer/TransMulti.css';
import { getCustomerID } from '../../jwt/AxiosToken';
import { useNavigate } from 'react-router-dom';

function TransMulti() {
  const navigate = useNavigate();

  // 출금 계좌 목록 상태
  const [accounts, setAccounts] = useState([]);

  // 출금 폼 상태
  const [form, setForm] = useState({
    out_account_number: '',
    password: '',
    memo: ''
  });

  // 입금 대상 리스트 상태
  const [transfers, setTransfers] = useState([
    { in_account_number: '', amount: '', in_name: '', memo: '' },
    { in_account_number: '', amount: '', in_name: '', memo: '' }
  ]);

  const customer_id = getCustomerID();
  const token = localStorage.getItem('auth_token');

  // 출금 계좌 목록 로딩
  useEffect(() => {
    if (!customer_id || !token) {
      alert('로그인이 필요합니다');
      navigate('/login');
      return;
    }
    RefreshToken.get(`http://localhost:8081/api/accounts/allAccount/${customer_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : Object.values(raw).flat();
      setAccounts(list);
    })
    .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  // 출금 폼 입력 처리
  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 개별 이체 항목 입력 처리 (금액 쉼표 및 소수점 포함 처리)
  const changeTransfer = (e, index) => {
    const { name, value } = e.target;
    const list = [...transfers];

    if (name === 'amount') {
      let raw = value.replace(/[^\d.]/g, '');
      raw = raw.replace(/^(\d*\.?\d*).*$/, '$1');

      const [intPart, decimalPart] = raw.split('.')
      const formatted = Number(intPart || 0).toLocaleString('en-US') + (decimalPart ? '.' + decimalPart : '');

      list[index][name] = raw;
      e.target.value = formatted; // 표시값
    } else {
      list[index][name] = value;
    }

    setTransfers(list);
  };

  // 이체 항목 행 추가
  const addRow = () => {
    setTransfers([...transfers, { in_account_number: '', amount: '', in_name: '', memo: '' }]);
  };

  // 이체 항목 행 삭제
  const removeRow = (index) => {
    const list = [...transfers];
    list.splice(index, 1);
    setTransfers(list);
  };

  // 총 이체 금액 계산
  const totalAmount = transfers.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // 이체 요청 처리
  const send = async () => {
    if (!form.out_account_number || !form.password || transfers.length === 0) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      // 비밀번호 확인
      const pwdRes = await RefreshToken.post('http://localhost:8081/api/transMulti/checkPwd', {
        account_number: form.out_account_number,
        password: form.password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (pwdRes.data !== true) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      // 이체 데이터 구성
      const data = {
        customer_id,
        out_account_number: form.out_account_number,
        password: form.password,
        memo: form.memo,
        transfers
      };

      // 이체 등록 요청
      await RefreshToken.post('http://localhost:8081/api/transMulti/add', data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('다건이체 요청이 완료되었습니다.');
      setTransfers([{ in_account_number: '', amount: '', in_name: '', memo: '' }]);
      navigate('/transMultiEdit');
    } catch (err) {
      console.error('이체 요청 실패:', err);
      alert('서버 오류로 이체 요청에 실패했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '600px' }}>
      <Sidebar />

      {/* 다건이체 폼 */}
      <div className="multi-wrap">
        <h2>다건이체</h2>

        {/* 출금 정보 영역 */}
        <div className="out-section">
          <label>출금계좌</label><br />
          <select className='selectCSS' name="out_account_number" value={form.out_account_number} onChange={changeForm}>
            <option value="">출금 계좌 선택</option>
            {accounts.map(acc => (
              <option key={acc.account_number} value={acc.account_number}>
                {acc.account_number} ({acc.account_type})
              </option>
            ))}
          </select>

          <br /><label style={{ marginTop: '20px' }}>계좌 비밀번호</label><br />
          <input className='inputCSS-short' type="password" name="password" value={form.password} onChange={changeForm} />
        </div>

        {/* 입금 정보 테이블 */}
        <div className="in-section">
          <h4>입금 정보</h4>
          <table className="multi-table">
            <thead>
              <tr>
                <th>입금계좌</th>
                <th>금액</th>
                <th>받는사람</th>
                <th>메모</th>
                <th>취소</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((row, index) => (
                <tr key={index}>
                  <td><input className='inputCSS-short' name="in_account_number" value={row.in_account_number} onChange={(e) => changeTransfer(e, index)} /></td>
                  <td><input className='inputCSS-short' type="text" name="amount" value={row.amount} onChange={(e) => changeTransfer(e, index)} /></td>
                  <td><input className='inputCSS-short' name="in_name" value={row.in_name} onChange={(e) => changeTransfer(e, index)} /></td>
                  <td><input className='inputCSS-short' name="memo" value={row.memo} onChange={(e) => changeTransfer(e, index)} /></td>
                  <td><button onClick={() => removeRow(index)} className="btn-delete">행삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addRow} className="btn-add">행 추가</button>
        </div>

        {/* 전송 영역 */}
        <div className="submit-area">
          <p>총 이체 금액: <strong>{totalAmount.toLocaleString()}원</strong></p>
          <button onClick={send} className="btn-send">다건이체 요청</button>
        </div>
      </div>
    </div>
  );
}

export default TransMulti;