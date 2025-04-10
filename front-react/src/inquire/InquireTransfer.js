import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Css/inquire/InquireTransfer.css';
import { getCustomerID } from "../jwt/AxiosToken";

function CheckTx() {
  const [accountList, setAccountList] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [txType, setTxType] = useState('전체');
  const [txResultList, setTxResultList] = useState([]);
  const [customerId, setCustomerId] = useState('');

  const getFormattedDate = (dateObj) => dateObj.toISOString().slice(0, 10);

  const handleDateRange = (days) => {
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - days + 1);
    setStartDate(getFormattedDate(fromDate));
    setEndDate(getFormattedDate(today));
  };

  useEffect(() => {
    const id = getCustomerID();
    const token = localStorage.getItem("auth_token");

    if (!id) {
      alert('로그인이 필요합니다.');
      return;
    }

    setCustomerId(id);

    axios.get(`http://localhost:8081/api/accounts/allAccount/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      let list = Array.isArray(response.data) ? response.data : Object.values(response.data).flat();
      setAccountList(list);
      if (list.length > 0) {
        setSelectedAccount(list[0].account_number || list[0].dat_account_num);
      }
    })
    .catch((error) => {
      console.error('계좌 목록 불러오기 실패:', error);
      setAccountList([]);
    });
  }, []);

  const formatFullDate = (dateStr) => {
    const d = new Date(dateStr);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const fetchTransactions = () => {
    const token = localStorage.getItem("auth_token");
    axios.get('http://localhost:8081/api/transactions', {
      params: {
        account_number: selectedAccount,
        start_date: startDate,
        end_date: endDate,
        transaction_type: txType,
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((response) => {
      setTxResultList(response.data);
    })
    .catch((error) => {
      console.error('거래내역 조회 실패:', error);
    });
  };

  return (
    <div className="checktx-wrap">
      <h2>{customerId}님의 거래내역 조회</h2>

      <div className="input-group">
        <label>계좌:</label>
        <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
          {accountList.map(account => (
            <option
              key={account.account_number || account.dat_account_num}
              value={account.account_number || account.dat_account_num}
            >
              {account.account_number || account.dat_account_num} ({account.account_type || account.dat_account_type})
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label>기간:</label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        ~
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <div className="range-buttons">
          <button onClick={() => handleDateRange(1)}>당일</button>
          <button onClick={() => handleDateRange(7)}>1주일</button>
          <button onClick={() => handleDateRange(30)}>1개월</button>
          <button onClick={() => handleDateRange(180)}>6개월</button>
        </div>
      </div>

      <div className="input-group">
        <label>유형:</label>
        <select value={txType} onChange={e => setTxType(e.target.value)}>
          <option>전체</option>
          <option>입금</option>
          <option>출금</option>
        </select>
      </div>

      <div className="search-button">
        <button onClick={fetchTransactions}>조회</button>
      </div>

      <div className="result-area">
        <h3>조회 결과</h3>
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
            {txResultList.length === 0 ? (
              <tr>
                <td colSpan="8" align="center">거래내역이 없습니다.</td>
              </tr>
            ) : (
              txResultList.map(tx => (
                <tr key={tx.transaction_id}>
                  <td>{formatFullDate(tx.transaction_date)}</td>
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