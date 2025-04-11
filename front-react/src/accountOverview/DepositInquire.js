import React, { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';

const DepositInquire = () => {
  const [deposit, setDeposit] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleAccountClick = (accountNumber) =>     
    navigate('/transactionHistory',{ state: { accountNumber } }); // 클릭한 계좌번호로 거래내역 페이지 이동


  // 잔액 합계 계산
  const sum = Array.isArray(deposit)
    ? deposit.reduce((acc, curr) => acc + curr.dat_balance, 0)
    : 0;

  // Spring Boot API 호출
  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/depositList'); // Spring Boot API 엔드포인트
        const data = await response.json();
        console.log('Fetched deposits:', data); // 응답 데이터 출력

        // 데이터가 배열인지 확인
        if (Array.isArray(data)) {
          setDeposit(data); // 데이터 설정
        } else {
          console.error('API 응답이 배열이 아닙니다:', data);
          setDeposit([]); // 기본값으로 빈 배열 설정
        }
      } catch (error) {
        console.log('Error fetching deposit', error);
        setDeposit([]); // 오류 발생 시 빈 배열 설정
      }
    };

    fetchDeposit();

    // 현재 시간 설정
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}
    -${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}
    :${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setCurrentTime(formattedTime);
  }, []);

  // 파일 저장 함수
  const saveToFile = () => {
    if (deposit.length === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // 파일 문자열 생성
    const headers = ['예금번호', '출금계좌', '예금계좌번호', '현재잔액', '가입기간', '개설일자', '만기일'];
    const rows = deposit.map((item) => [
      item.dat_id,
      item.dat_account_num,
      item.dat_deposit_account,
      item.dat_balance,
      item.dat_term,
      item.dat_start_day,
      item.dat_end_day,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    // Blob 생성 및 다운로드
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'deposit_data.csv'); // 다운로드할 파일 이름
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // 링크 제거
  };

  return (
    <div style={{ minHeight: 600, padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ textAlign: 'center' }}>예금/적금 계좌조회</h1>
        <button
          onClick={saveToFile}
          style={{
            padding: '10px 20px',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          파일 저장
        </button>
      </div>
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        기준일시 : {currentTime}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '10px' }}>예금번호</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>출금계좌</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>예금계좌번호</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>현재잔액</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>가입기간</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>개설일자</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>만기일</th>
          </tr>
        </thead>
        <tbody>
          {deposit && deposit.length > 0 ? (
            deposit.map((deposit, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_id}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_account_num}</td>
                <td style={{ border: '1px solid black', padding: '10px' , color: 'blue', cursor: 'pointer'}}
                  onClick={() => handleAccountClick(deposit.dat_deposit_account_num)} // 계좌번호 클릭 시 상세 페이지로 이동
                >{deposit.dat_deposit_account_num}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_balance.toLocaleString()}원</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_term}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_start_day}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_end_day}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '10px' }}>데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        예금/적금 합계: {sum.toLocaleString()} 원
      </div>
    </div>
  );
};

export default DepositInquire;