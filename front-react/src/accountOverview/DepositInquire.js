import React, { useEffect, useState } from 'react';


const DepositInquire = () => {
  const [deposit, setDeposit] = useState([]);
  const sum = deposit.reduce((acc, curr) => acc + curr.dat_balance, 0); // 잔액 합계 계산
  const [currentTime, setCurrentTime] = useState(''); 

  // Spring Boot API 호출
  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/depositList'); // Spring Boot API 엔드포인트
        const data = await response.json();
        console.log('Fetched deposits:', data); // 응답 데이터 출력
        setDeposit(data); // 데이터 설정
      } catch (error) {
        console.log('Error fetching deposit', error);
      }
    };
    fetchDeposit();


   // 현재 시간 설정
   const now = new Date();
   const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}
   -${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}
   :${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
   setCurrentTime(formattedTime);
},[]);

   // 파일 저장 함수
   const saveToFile = () =>{
      if(deposit.length === 0){
        alert("저장할 데이터가 없습니다.");
        return;
      }
   

   // 파일 문자열 생성
   const headers = ['계좌번호', '고객이름', '잔액', '계좌유형', '신규일', '만기일'];
   const rows = deposit.map((item) =>[
      item.datAccountNum,
      item.datCustomerName,
      item.datBalance,
      item.datAccountType,
      item.datOpenDate,
      '', // 만기일은 데이터에 없으므로 빈 문자열로 설정
   ]);

   const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

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
            <th style={{ border: '1px solid black', padding: '10px' }}>계좌번호</th> 
            <th style={{ border: '1px solid black', padding: '10px' }}>고객이름</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>잔액</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>계좌유형</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>신규일</th>
            <th style={{ border: '1px solid black', padding: '10px' }}>만기일</th>
          </tr>
        </thead>
        <tbody>
          {deposit && deposit.length > 0 ? (
            deposit.map((deposit, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_account_Num}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_customer_Name}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_balance.toLocaleString()}원</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_account_Type}</td>
                <td style={{ border: '1px solid black', padding: '10px' }}>{deposit.dat_openDate}</td>                
                <td style={{ border: '1px solid black', padding: '10px' }}></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>데이터가 없습니다.</td>
            </tr>
          )}
        </tbody>

        예금/적금 : {sum.toLocaleString()} 원
        
      </table>
    </div>
  );
};


export default DepositInquire;