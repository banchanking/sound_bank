import React, { useEffect, useState } from 'react';
import RefreshToken from '../../jwt/RefreshToken'; 
import Sidebar from './Sidebar';
import styles from '../../Css/transfer/TransMulti.module.css';
import { getCustomerID } from '../../jwt/AxiosToken';
import { useNavigate } from 'react-router-dom';

function TransMulti() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ out_account_number: '', password: '', memo: '' });

  const [transfers, setTransfers] = useState([
    { in_account_number: '', amount: '', in_name: '', memo: '' },
    { in_account_number: '', amount: '', in_name: '', memo: '' }
  ]);

  const customer_id = getCustomerID();
  const token = localStorage.getItem('auth_token');

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

  const changeForm = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const changeTransfer = (e, index) => {
    const { name, value } = e.target;
    const list = [...transfers];

    if (name === 'amount') {
      const raw = value.replace(/[^\d.]/g, '');
      const [intPart] = raw.split('.');
      const formatted = Number(intPart || 0).toLocaleString('ko-KR');
      list[index][name] = raw;
      e.target.value = formatted;
    } else {
      list[index][name] = value;
    }

    setTransfers(list);
  };

  const addRow = () => {
    setTransfers([...transfers, { in_account_number: '', amount: '', in_name: '', memo: '' }]);
  };

  const removeRow = (index) => {
    const list = [...transfers];
    list.splice(index, 1);
    setTransfers(list);
  };

  const totalAmount = transfers.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const send = async () => {
    if (!form.out_account_number || !form.password || transfers.length === 0) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
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

      const data = {
        customer_id,
        out_account_number: form.out_account_number,
        password: form.password,
        memo: form.memo,
        transfers
      };

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

      <div className={styles.multiWrap}>
        <h2 className={styles.title}>다건이체</h2>

        <div className={styles.outSection}>
          <label>출금계좌</label>
          <select className={styles.selectCSS} name="out_account_number" value={form.out_account_number} onChange={changeForm}>
            <option value="">출금 계좌 선택</option>
            {accounts.map(acc => (
              <option key={acc.account_number} value={acc.account_number}>
                {acc.account_number} ({acc.account_type})
              </option>
            ))}
          </select>

          <label style={{ marginTop: '16px' }}>계좌 비밀번호</label>
          <input className={styles.inputpwd} type="password" name="password" value={form.password} onChange={changeForm} />
        </div>

        <div className={styles.inSection}>
          <h4>입금 정보</h4>
          <table className={styles.multiTable}>
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
                  <td><input className={styles.inputShort} name="in_account_number" value={row.in_account_number} onChange={(e) => changeTransfer(e, index)} /></td>
                  <td><input className={styles.inputShort} type="text" name="amount" value={row.amount} onChange={(e) => changeTransfer(e, index)} /></td>
                  <td><input className={styles.inputShort} name="in_name" value={row.in_name} onChange={(e) => changeTransfer(e, index)} /></td>
                  <td><input className={styles.inputShort} name="memo" value={row.memo} onChange={(e) => changeTransfer(e, index)} /></td>
                  <td><button onClick={() => removeRow(index)} className={styles.btnDelete}>삭제</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addRow} className={styles.btnAdd}>행 추가</button>
        </div>

        <div className={styles.submitArea}>
          <p className={styles.totalAmount}>총 이체 금액: <strong>{totalAmount.toLocaleString('ko-KR')}원</strong></p>
          <button onClick={send} className={styles.btnSend}>다건이체 요청</button>
        </div>
      </div>
    </div>
  );
}

export default TransMulti;
