import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Css/inquire/InquireTransfer.css'; // 스타일 분리

function CheckTx() {
  const [accList, setAccList] = useState([]);
  const [pickAcc, setPickAcc] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [kind, setKind] = useState('전체');
  const [txList, setTxList] = useState([]);
  const [customer_id, setCustomerId] = useState('');

  // 날짜 포맷 yyyy-MM-dd
  const getDate = (d) => d.toISOString().slice(0, 10);

  // 버튼 클릭 시 기간 설정
  const pickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setDateStart(getDate(start));
    setDateEnd(getDate(end));
  };

  // 계좌 목록 불러오기
  useEffect(() => {
    const id = localStorage.getItem('customer_id');
    if (!id) {
      alert('로그인이 필요합니다.');
      return;
    }

    setCustomerId(id);

    axios.get(`http://15.165.57.30:8081/api/accounts/allAccount/${id}`)
      .then(res => {
        const raw = res.data;
        let list = [];

        if (Array.isArray(raw)) list = raw;
        else if (typeof raw === 'object') list = Object.values(raw).flat();

        setAccList(list);

        if (list.length > 0) {
          setPickAcc(list[0].account_number || list[0].dat_account_num);
        }
      })
      .catch(err => {
        console.error('계좌 목록 오류', err);
        setAccList([]);
      });
  }, []);

  // 날짜 포맷 함수: YYYY-MM-DD HH:mm:ss
  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // 거래내역 조회 요청
  const searchTx = () => {
    axios.get('http://15.165.57.30:8081/api/transactions', {
      params: {
        account_number: pickAcc,
        start_date: dateStart,
        end_date: dateEnd,
        transaction_type: kind
      }
    })
      .then(res => setTxList(res.data))
      .catch(err => console.error('조회 실패', err));
  };

  return (
    <div className="checktx-wrap">
      <h2>{customer_id}님의 거래내역 조회</h2>

      {/* 계좌 선택 */}
      <div className="input-group">
        <label>계좌:</label>
        <select value={pickAcc} onChange={e => setPickAcc(e.target.value)}>
          {accList.map(acc => (
            <option key={acc.account_number || acc.dat_account_num} value={acc.account_number || acc.dat_account_num}>
              {acc.account_number || acc.dat_account_num} ({acc.account_type || acc.dat_account_type})
            </option>
          ))}
        </select>
      </div>

      {/* 날짜 입력 */}
      <div className="input-group">
        <label>기간:</label>
        <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} />
        ~
        <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
        <div className="range-buttons">
          <button onClick={() => pickRange(1)}>당일</button>
          <button onClick={() => pickRange(7)}>1주일</button>
          <button onClick={() => pickRange(30)}>1개월</button>
          <button onClick={() => pickRange(180)}>6개월</button>
        </div>
      </div>

      {/* 거래유형 선택 */}
      <div className="input-group">
        <label>유형:</label>
        <select value={kind} onChange={e => setKind(e.target.value)}>
          <option>전체</option>
          <option>입금</option>
          <option>출금</option>
        </select>
      </div>

      {/* 조회 버튼 */}
      <div className="search-button">
        <button onClick={searchTx}>조회</button>
      </div>

      {/* 결과 테이블 */}
      <div className="result-area">
        <h3>결과</h3>
        <table>
          <thead>
            <tr>
              <th>날짜</th>
              <th>유형</th>
              <th>금액</th>
              <th>통화</th>
              <th>입금메모</th>
              <th>출금메모</th>
            </tr>
          </thead>
          <tbody>
            {txList.length === 0 ? (
              <tr>
                <td colSpan="6" align="center">거래내역이 없습니다.</td>
              </tr>
            ) : (
              txList.map(tx => (
                <tr key={tx.transaction_id}>
                  <td>{formatDateTime(tx.transaction_date)}</td>
                  <td>{tx.transaction_type}</td>
                  <td>{tx.amount.toLocaleString()}원</td>
                  <td>{tx.currency}</td>
                  <td>{tx.comment_in}</td>
                  <td>{tx.comment_out}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CheckTx;
