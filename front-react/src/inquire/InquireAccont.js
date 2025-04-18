import React, { useEffect, useState } from 'react';
import RefreshToken from "../jwt/RefreshToken"; 
import '../Css/inquire/InquireAccount.css';
import { getCustomerID } from "../jwt/AxiosToken";
import { useNavigate } from 'react-router-dom';


function AccountCheck() {
    
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [type, setType] = useState(null);
  const [accNum, setAccNum] = useState(null);
  const [customer_id, setCustomerId] = useState('');

  useEffect(() => {
    const id = getCustomerID();   // 로그인된 사용자 ID 가져오기
    if (!id) {
      alert('로그인이 필요합니다.');
      navigate('/login')
      return;
    }

    setCustomerId(id);

    RefreshToken.get(`http://localhost:8081/api/accounts/allAccount/${id}`)
      .then(res => setData(res.data))
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  const clickCard = (num) => {
    setAccNum(num);
  };

  // 계좌 카드 컴포넌트
  const Card = ({ item }) => {
    return (
      <div
        onClick={() => clickCard(item.account_number)}
        className={`account-card ${accNum === item.account_number ? 'selected' : ''}`}
      >
        <div><strong>{item.account_name}</strong></div>
        <div>{item.account_number}</div>
      </div>
    );
  };

  // 계좌 상세 정보
  const Detail = ({ item }) => {
    return (
      <div className="account-detail">
        <h4>상세 정보</h4>
        <p><b>이름:</b> {item.account_name}</p>
        <p><b>번호:</b> {item.account_number}</p>
        <p><b>잔액:</b> {item.balance.toLocaleString("ko-KR")} 원</p>
        <p><b>이자율:</b> {item.interest_rate || 0}%</p>
        <p><b>개설일:</b> {new Date(item.open_date).toLocaleString()}</p>
      </div>
    );
  };

  return (
    <div className="account-wrapper">
      <h2 className="account-title">{customer_id}님의 계좌 조회</h2>

      <div className="account-type-buttons">
        {['입출금', '예금', '적금'].map(t => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setAccNum(null);
            }}
            className={type === t ? 'active' : ''}
          >
            {t} ({(data[t] || []).length})
          </button>
        ))}
      </div>

      {type && data[type] && (
        <div>
          <h3>{type} 계좌</h3>
          {data[type].length > 0 ? (
            data[type].map(item => (
              <Card key={item.account_number} item={item} />
            ))
          ) : (
            <p>해당 타입의 계좌가 없습니다.</p>
          )}
        </div>
      )}

      {type && accNum && (
        <Detail item={data[type].find(a => a.account_number === accNum)} />
      )}
    </div>
  );
}

export default AccountCheck;
