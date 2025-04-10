import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Css/inquire/InquireAccount.css';
import { getCustomerID } from "../jwt/AxiosToken";

function AccountCheck() {
  const [data, setData] = useState({});
  const [type, setType] = useState(null);
  const [accNum, setAccNum] = useState(null);
  const [customer_id, setCustomerId] = useState('');

  useEffect(() => {
    const id = getCustomerID();   // AxiosToken파일내 아이디 함수 활용
    const token = localStorage.getItem("auth_token"); // JWT 토큰 가져오기

    if (!id) {
      alert('로그인이 필요합니다.');
      return;
    }

    setCustomerId(id);

    axios.get(`http://localhost:8081/api/accounts/allAccount/${id}`,{
      headers: {
        Authorization: `Bearer ${token}`
          }
        })
      .then(res => setData(res.data)) 
      .catch(err => console.error('계좌 불러오기 실패:', err)); 
  }, []);

  const clickCard = (num) => {
    setAccNum(num);
  };

  // 계좌 카드 컴포넌트 (계좌 목록 중 하나를 표시)
  const Card = ({ item }) => {
    return (
      <div
        // 카드 클릭 시 계좌번호 넘김task
        onClick={() => clickCard(item.account_number)}
        // 선택된 계좌는 클래스에 selected 추가
        className={`account-card ${accNum === item.account_number ? 'selected' : ''}`}
      >
        <div><strong>{item.account_name}</strong></div> 
        <div>{item.account_number}</div>
      </div>
    );
  };

  // 계좌 상세 정보 컴포넌트 (선택된 계좌의 상세 정보 표시)
  const Detail = ({ item }) => {
    return (
      <div className="account-detail">
        <h4>상세 정보</h4>
        <p><b>이름:</b> {item.account_name}</p> 
        <p><b>번호:</b> {item.account_number}</p> 
        <p><b>잔액:</b> {item.balance.toLocaleString()}원</p> 
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
            // 버튼 클릭 시 타입 저장, 선택된 계좌 초기화
            onClick={() => {
              setType(t);
              setAccNum(null);
            }}
            // 선택된 타입은 스타일 강조
            className={type === t ? 'active' : ''}
          >
            {/* 타입명 + 계좌 수 표시 */}
            {t} ({(data[t] || []).length})
          </button>
        ))}
      </div>

      {/* 선택된 타입의 계좌 목록 표시 */}
      {type && data[type] && (
        <div>
          <h3>{type} 계좌</h3>
          {/* 계좌가 있으면 목록 표시 */}
          {data[type].length > 0 ? (
            data[type].map(item => (
              <Card key={item.account_number} item={item} />
            ))
          ) : (
            // 계좌 없으면 안내 메시지
            <p>해당 타입의 계좌가 없습니다.</p>
          )}
        </div>
      )}

      {/* 계좌 클릭 시 상세정보 표시 */}
      {type && accNum && (
        <Detail
          // 선택된 계좌 객체 찾기
          item={data[type].find(a => a.account_number === accNum)}
        />
      )}
    </div>
  );
}

// 컴포넌트 외부에서 사용 가능하게 내보내기
export default AccountCheck;
