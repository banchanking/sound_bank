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
    if (!customer_id) {
      const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
      if (goLogin) {
        navigate("/login");
      } else {
        navigate("/");
      }
      return;
    }

    RefreshToken.get(`/accounts/allAccount/${customer_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : Object.values(raw).flat();
        setAccounts(list);
      })
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  const getAccountTypeLabel = (type) => {
    if (type === 'CHECKING') return '입출금';
    if (type === 'DEPOSIT') return '예금';
    if (type === 'SAVINGS') return '적금';
    return type || '알수없음';
  };

  const changeForm = (e) => {
    const { name, value } = e.target;

    if (name === 'out_account_number') {
      const selected = accounts.find(acc => acc.account_number === value);
      const type = selected?.account_type;
      if (type === 'DEPOSIT' || type === 'SAVINGS') {
        alert('예/적금 계좌이체는 예/적금 메뉴에서 진행 가능합니다.');
        navigate('/depositWithdrawal');
        return;
      }
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const changeTransfer = (e, index) => {
    const { name, value } = e.target;
    const list = [...transfers];

    if (name === 'amount') {
      const raw = value.replace(/[^\d.]/g, '');
      const [intPart] = raw.split('.');
      list[index][name] = raw;
      e.target.value = Number(intPart || 0).toLocaleString('ko-KR');
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
      const pwdRes = await RefreshToken.post(
        '/transMulti/checkPwd',
        { account_number: form.out_account_number, password: form.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

      await RefreshToken.post(
        '/transMulti/add',
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('다건이체 요청이 완료되었습니다.');
      setTransfers([{ in_account_number: '', amount: '', in_name: '', memo: '' }]);
      navigate('/transMultiEdit');
    } catch (err) {
      console.error('이체 요청 실패:', err);
      alert('서버 오류로 이체 요청에 실패했습니다.');
    }
  };

  const selectedAccount = accounts.find(acc => acc.account_number === form.out_account_number);

  return (
    <div style={{ display: 'flex', minHeight: '600px' }}>
      <Sidebar />

      <div className={styles['multi-multiWrap']}>
        <h2 className={styles['multi-title']}>다건이체</h2>

        <div className={styles['multi-outSection']}>
          <label>출금계좌</label>
          <select
            className={styles['multi-selectCSS']}
            name="out_account_number"
            value={form.out_account_number}
            onChange={changeForm}
            required
          >
            <option value="">출금 계좌 선택</option>
            {accounts.map(acc => (
              <option key={acc.account_number} value={acc.account_number}>
                {acc.account_number} ({getAccountTypeLabel(acc.account_type)})
              </option>
            ))}
          </select>

          {selectedAccount && (
            <div style={{ marginLeft: '10px', marginTop: '10px', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
              잔액: {Number(
                selectedAccount.balance ?? selectedAccount.account_balance ?? 0
              ).toLocaleString('ko-KR')} 원
            </div>
          )}

          <label style={{ marginTop: '16px' }}>계좌 비밀번호</label>
          <input
            className={styles['multi-inputpwd']}
            type="password"
            name="password"
            value={form.password}
            onChange={changeForm}
          />
        </div>

        <div className={styles.inSection}>
          <h4>입금 정보</h4>
          <table className={styles['multi-multiTable']}>
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
              {transfers.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      className={styles['multi-inputShort']}
                      name="in_account_number"
                      value={row.in_account_number}
                      onChange={e => changeTransfer(e, idx)}
                    />
                  </td>
                  <td>
                    <input
                      className={styles['multi-inputShort']}
                      type="text"
                      name="amount"
                      value={row.amount}
                      onChange={e => changeTransfer(e, idx)}
                    />
                  </td>
                  <td>
                    <input
                      className={styles['multi-inputShort']}
                      name="in_name"
                      value={row.in_name}
                      onChange={e => changeTransfer(e, idx)}
                    />
                  </td>
                  <td>
                    <input
                      className={styles['multi-inputShort']}
                      name="memo"
                      value={row.memo}
                      onChange={e => changeTransfer(e, idx)}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => removeRow(idx)}
                      className={styles['multi-btnDelete']}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addRow} className={styles['multi-btnAdd']}>
            추가
          </button>
        </div>

        <div className={styles['multi-submitArea']}>
          <p className={styles['multi-totalAmount']}>
            총 이체 금액: <strong>{totalAmount.toLocaleString('ko-KR')}원</strong>
          </p>
          <button onClick={send} className={styles['multi-btnSend']}>
            다건이체 요청
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransMulti;
