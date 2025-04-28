import React, { useEffect, useState } from 'react';
import RefreshToken from "../jwt/RefreshToken";
import { getCustomerID } from "../jwt/AxiosToken";
import { useNavigate } from 'react-router-dom';
import styles from '../Css/inquire/InquireAccount.module.css';

function AccountCheck() {
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [type, setType] = useState(null);
  const [accNum, setAccNum] = useState(null);
  const [customer_id, setCustomerId] = useState('');

  useEffect(() => {
    const id = getCustomerID();
    if (!id) {
      const goLogin = window.confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?");
      if (goLogin) {
        navigate("/login");
      } else {
        navigate("/");
      }
      return;
    }
    setCustomerId(id);

    RefreshToken.get(`/accounts/allAccount/${id}`)
      .then(res => setData(res.data))
      .catch(err => console.error('계좌 불러오기 실패:', err));
  }, []);

  const clickCard = (num) => {
    setAccNum(num);
  };

  const Card = ({ item }) => (
    <div
      onClick={() => clickCard(item.account_number)}
      className={`${styles["account-card"]} ${accNum === item.account_number ? styles["account-selected"] : ''}`}
    >
      <div className={styles["account-cardName"]}><strong>{item.account_name}</strong></div>
      <div className={styles["account-cardNumber"]}>{item.account_number}</div>
    </div>
  );

  const Detail = ({ item }) => (
    <div className={styles["account-detail"]}>
      <h4>상세 정보</h4>
      <p><b>이름:</b> {item.account_name}</p>
      <p><b>번호:</b> {item.account_number}</p>
      <p><b>잔액:</b> {item.balance.toLocaleString("ko-KR")} 원</p>
      <p><b>이자율:</b> {item.interest_rate || 0}%</p>
      <p><b>개설일:</b> {new Date(item.open_date).toLocaleString()}</p>
    </div>
  );

  // "이체하기" 버튼 클릭
  const handleTransfer = () => {
    if (!accNum) {
      alert("이체할 계좌를 선택하세요.");
      return;
    }
    navigate('/transInstant');
  };

  // "입출금 계좌 해지" 버튼 클릭
  const handleCloseAccount = () => {
    if (!accNum) {
      alert("해지할 계좌를 선택하세요.");
      return;
    }

    const selected = data[type].find(a => a.account_number === accNum);
    if (!selected) {
      alert("선택한 계좌를 찾을 수 없습니다.");
      return;
    }

    if (selected.balance > 0) {
      const moveToTransfer = window.confirm("잔액이 남아 있습니다. 먼저 본인 명의 다른 계좌로 이체해 주세요.");
      if (moveToTransfer) {
        navigate('/transInstant');
      }
      return;
    }

    const confirmClose = window.confirm("정말로 계좌를 해지하시겠습니까?");
    if (confirmClose) {
      RefreshToken.post(`/accounts/closeAccount/${accNum}`)
        .then(() => {
          alert("계좌가 성공적으로 해지되었습니다.");
          navigate('/mypage');
        })
        .catch(err => {
          console.error('계좌 해지 실패:', err);
          alert("계좌 해지에 실패했습니다.");
        });
    }
  };

  return (
    <div className={styles["account-wrapper"]}>
      <h2 className={styles["account-title"]}>{customer_id}님의 계좌 조회</h2>

      <div className={styles["account-buttonGroup"]}>
        {['입출금', '예금', '적금'].map(t => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setAccNum(null);
            }}
            className={`${styles["account-tabButton"]} ${type === t ? styles["account-active"] : ''}`}
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

      <div className={styles["account-buttonArea"]}>
        <button className={styles["account-transferButton"]} onClick={handleTransfer}>
          이체하기
        </button>
        <br /><br />
        <button className={styles["account-transferButton2"]} onClick={handleCloseAccount}>
          입출금계좌 해지 (회원탈퇴용)
        </button>
      </div>
    </div>
  );
}

export default AccountCheck;
