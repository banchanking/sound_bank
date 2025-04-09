import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../Css/exchange/ExRate.module.css";

import ExCalc from "./ExCalc";
import RefreshToken from "../../jwt/RefreshToken";

const ExRate = () => {
  
    const [exchange, setExchange] = useState([]);
    const [date, setDate] = useState("");
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // 날짜 포맷 함수
    const formatDate = (dateObj) => {
      const offset = dateObj.getTimezoneOffset();
      const localDate = new Date(dateObj.getTime() - offset * 60 * 1000);
      return localDate.toISOString().split("T")[0];
    };
    
    // 환율 조회
    const fetchExchangeRates = (selectedDate) => {
      const formattedDate = formatDate(new Date(selectedDate));
      console.log("조회할 날짜:", formattedDate);
      setLoading(true); // 로딩 시작

      RefreshToken.get('http://localhost:8081/api/exchange/rates', {
        params: { date: formattedDate }
      })
        .then((res) => {
          console.log("api데이터", res.data);
          if (Array.isArray(res.data)) {
            setExchange(res.data);
          } else {
            setExchange([]);
          }
        })
        .catch((err) => {
          console.error("에러", err);
          alert("환율 정보를 불러오는 중 오류가 발생했습니다.");
          setExchange([]);
        })
        .finally(() => {
          setLoading(false); // 로딩 종료
          console.log("로딩 종료");
        });
    };
    
    // 초기 로드
    useEffect(() => {
      const today = new Date();
      const formatted = formatDate(today);
      setDate(formatted);
    }, []);
    
    // 날짜 변경 시 API 호출
    useEffect(() => {
      if (date) {
        fetchExchangeRates(date);
      }
    }, [date]);
    
    // 날짜 선택 핸들러
    const handleDateChange = (e) => {
      setDate(e.target.value);
    };
    

    

  return (
    <div classname={styles.container}>       
        <div className={styles.calcButtonWrapper}>
          {/* 환율 계산기 열기 버튼 */}
          <button className={styles.calcButton} onClick={() => setIsCalculatorOpen(true)}>환율 계산기 열기</button>        
        </div>
      
        {/* 날짜 입력 필드 */}
        <div className={styles.dateInput}>
            <label htmlFor="date">날짜 선택: </label>
            <input
                type="date"
                id="date"
                value={date}
                onChange={handleDateChange}
            />
            <h5> * 영업일 11시 전후로 업데이트 됩니다 </h5>
            <h5> * 주말&공휴일 환율은 조회되지 않습니다. </h5>
        </div>
        
        <div>               
        {/* 환율 계산기 팝업 */}
        <ExCalc
            isOpen={isCalculatorOpen}
            onClose={() => setIsCalculatorOpen(false)}
            exchange={exchange}
        />        
        </div>
        {loading ? (
          <p style={{ textAlign: "center", marginTop: "20px", minHeight:"570px"}}>
             💸 환율 정보를 불러오는 중입니다 💸
          </p>
        ) : (
        <table border="1" className={styles.table}>
            <thead>
                <tr>
                <th>통화 코드</th>
                    <th>국가/통화명</th>
                    <th>전신환(송금) 받으실 때</th>
                    <th>전신환(송금) 보내실 때</th>
                    <th>매매 기준율</th>
                    <th>장부가격</th>
                    <th>서울외국환중개 매매기준율</th>
                    <th>서울외국환중개 장부가격</th>
                </tr>
            </thead>
            <tbody>
                {exchange.map((item, index) => (
                    <tr key={index}>
                        <td>{item.cur_unit}</td> {/* 필드 이름이 소문자일 경우*/}
                        <td>{item.cur_nm}</td>
                        <td>{item.ttb}</td>
                        <td>{item.tts}</td>
                        <td>{item.deal_bas_r}</td>
                        <td>{item.bkpr}</td>
                        <td>{item.kftc_deal_bas_r}</td>
                        <td>{item.kftc_bkpr}</td>
                    </tr>
                ))}
            </tbody>
        </table>         
        )}
    </div>
);
};

export default ExRate;
