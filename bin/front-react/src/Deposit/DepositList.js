import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DepositList.css'; // CSS 파일을 불러옵니다.

const DepositList = ({ deposits }) => {
  const navigate = useNavigate();

  return (
    <div className="depositList">
      <h2 className="depositTitle">예금 내역</h2>
      <ul>
        {deposits.map(deposit => (
          <li key={deposit.id}>
            <span>{deposit.date}</span>
            <span>${deposit.amount}</span>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate('/deposit/add')}>예금 추가</button>
      <button onClick={() => navigate('/deposit/calculator')}>예금 계산기</button>
    </div>
  );
};

export default DepositList;