import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Css/AccountOverview/DepositInquire.css';

const DepositInquire = () => {
  const [deposit, setDeposit] = useState([]); // 예금/적금 데이터 상태
  const [currentTime, setCurrentTime] = useState(''); // 현재 시간 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 훅
  const customerId = localStorage.getItem('customerId'); // 로컬 스토리지에서 고객 ID 가져오기

  // 계좌번호 클릭 시 거래내역 페이지로 이동
  const handleAccountClick = (accountNumber) =>
    navigate('/transactionHistory', { state: { accountNumber } });

  // 잔액 합계 계산
  const sum = Array.isArray(deposit)
    ? deposit.reduce((acc, curr) => acc + curr.dat_balance, 0)
    : 0;

  // Spring Boot API 호출
  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const response = await fetch(`http://localhost:8081/api/depositList?customerId=${customerId}`); // 고객 ID를 쿼리 파라미터로 전달
        const data = await response.json();
        console.log('API 응답 데이터:', data); // API 응답 데이터 출력

        // 데이터가 배열인지 확인
        if (Array.isArray(data)) {
          // 데이터 구조 확인을 위한 로그
          if (data.length > 0) {
            console.log('첫 번째 계좌 데이터:', data[0]);
          }
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
  }, [customerId]);

  // 파일 저장 함수
  const saveToFile = () => {
    if (deposit.length === 0) {
      alert('저장할 데이터가 없습니다.');
      return;
    }

    // 파일 문자열 생성
    const headers = ['계좌종류', '출금계좌', '예금계좌번호', '현재잔액', '가입기간', '개설일자', '만기일'];
    const rows = deposit.map((item) => [
      item.dat_transaction_type,
      item.dat_account_num,
      item.dat_deposit_account_num,
      item.dat_balance,
      item.dat_term,
      item.dat_start_day,
      item.dat_end_day,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');

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
    <div className="deposit-inquire-container">
      <h1 className="deposit-inquire-title">예금/적금 계좌조회</h1>

      <div className="deposit-inquire-info">
        <h2>기준일시: {currentTime}</h2>
      </div>

      <table className="deposit-inquire-table">
        <thead>
          <tr>
            <th>계좌종류</th>
            <th>출금계좌</th>
            <th>예금계좌번호</th>
            <th>현재잔액</th>
            <th>가입기간</th>
            <th>개설일자</th>
            <th>만기일</th>
          </tr>
        </thead>
        <tbody>
          {deposit.map((item, index) => (
            <tr key={index} onClick={() => handleAccountClick(item.dat_deposit_account_num)}>
              <td>{item.dat_transaction_type}</td>
              <td>{item.dat_account_num}</td>
              <td>{item.dat_deposit_account_num}</td>
              <td>{item.dat_balance.toLocaleString()}원</td>
              <td>{item.dat_term}</td>
              <td>{item.dat_start_day}</td>
              <td>{item.dat_end_day}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="deposit-inquire-info">
        <h2>예금/적금 합계: {sum.toLocaleString()}원</h2>
      </div>

      <div className="button-group">
        <button onClick={saveToFile} className="action-button submit-button">
          파일 저장
        </button>
      </div>
    </div>
  );
};

export default DepositInquire;