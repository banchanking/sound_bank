// TransMulti.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import '../../Css/transfer/TransMulti.css';
import { getCustomerID } from '../../jwt/AxiosToken';

function TransMulti() {
  const [accounts, setAccounts] = useState([]);     // 출금계좌 목록
  const [form, setForm] = useState({
    out_account_number: '',
    memo: '',
    password: '',
  });

  const [inputs, setInputs] = useState(
    Array.from({ length: 2 }, () => ({
      in_account_number: '',
      amount: '',
      in_name: '',
      memo: ''
    }))
  );

  const customer_id = getCustomerID();
  const token = localStorage.getItem('auth_token');

  // 출금계좌 목록 불러오기
  useEffect(() => {
    if (!customer_id || !token) {
      alert('로그인이 필요합니다');
      return;
    }
    axios.get(`http://localhost:8081/api/accounts/allAccount/${customer_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      const raw = res.data;
      let list = Array.isArray(raw) ? raw : Object.values(raw).flat();
      setAccounts(list);
    })
    .catch(err => console.error('출금계좌 불러오기 실패:', err));
  }, []);

  // 전체 입력 값 변경
  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };



  const changeInput = (e, index) => {
    const { name, value } = e.target;
    const newInputs = [...inputs];
    newInputs[index][name] = value;
    setInputs(newInputs);
  };

  const addRow = () => {
    setInputs([...inputs, { in_account_number: '', amount: '', in_name: '', memo: '' }]);
  };

  const removeRow = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  const totalAmount = inputs.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const send = () => {
    if (!form.out_account_number || !form.password || inputs.length === 0) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    const data = {
      ...form,
      customer_id,
      transfers: inputs,
    };

    axios.post('http://localhost:8081/api/transMulti/add', data, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      alert('다건이체요청 정상적으로 접수되었습니다.');
      setInputs([{ in_account_number: '', amount: '', in_name: '', memo: '' }]);
    })
    .catch(err => {
      console.error('이체 요청 실패:', err);
      alert('서버 오류로 전송에 실패했습니다.');
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '600px' }}>
      <Sidebar />

      <div className="multi-wrap">
        <h2>다건이체</h2>

        <div className="out-section">
          <label>출금계좌</label>
          <select className='selectCSS' name="out_account_number" value={form.out_account_number} onChange={changeForm}>
            <option value="">선택하세요</option>
            {accounts.map(acc => (
              <option key={acc.account_number} value={acc.account_number}>
                {acc.account_number} ({acc.account_type})
              </option>
            ))}
          </select>

          <label style={{marginTop: '20px' }}>계좌 비밀번호</label>
          <input className='inputCSS-short' type="password" name="password" value={form.password} onChange={changeForm} />
        </div>
        <br></br>

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
              {inputs.map((row, index) => (
                <tr key={index}>
                  <td><input className='inputCSS-short' name="in_account_number" value={row.in_account_number} onChange={(e) => changeInput(e, index)} /></td>
                  <td><input className='inputCSS-short' type="number" name="amount" value={row.amount} onChange={(e) => changeInput(e, index)} /></td>
                  <td><input className='inputCSS-short' name="in_name" value={row.in_name} onChange={(e) => changeInput(e, index)} /></td>
                  <td><input className='inputCSS-short' name="memo" value={row.memo} onChange={(e) => changeInput(e, index)} /></td>
                  <td><button onClick={() => removeRow(index)} className="btn-delete">행삭제</button></td>
                </tr>
              ))}
            </tbody>

          </table>

          <button onClick={addRow} className="btn-add">행 추가</button>
        </div>

        <br></br><br></br>
        <div className="submit-area">
          <p>총 이체 금액: <strong>{totalAmount.toLocaleString()}원</strong></p>
          <button onClick={send} className="btn-send">다건이체 요청</button>
        </div>
      </div>
    </div>
  );
}

export default TransMulti;
