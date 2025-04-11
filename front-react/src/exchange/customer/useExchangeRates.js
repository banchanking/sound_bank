import { useState, useEffect } from "react";
import RefreshToken from "../../jwt/RefreshToken";

const normalizeRateData = (item) => {
  if (item.cur_unit) {
    // API에서 가져온 데이터 형식에 맞게 변환
    return {                  
      currency_code: item.cur_unit,                              //통화코드
      currency_name: item.cur_nm,                                //통화명
      base_rate: parseFloat(item.deal_bas_r.replace(",", "")),   //기준환율
      buy_rate: parseFloat(item.tts.replace(",", "")),           //매입환율         
      sell_rate: parseFloat(item.ttb.replace(",", "")),          //매도환율             
    };
  } else {
    // DB에서 가져온 데이터 형식에 맞게 변환
    return {
      currency_code: item.CURRENCY_CODE,
      currency_name: item.CURRENCY_NAME,
      base_rate: parseFloat(item.BASE_RATE),
      buy_rate: parseFloat(item.BUY_RATE),
      sell_rate: parseFloat(item.SELL_RATE),
    };
  }
};

const useExchangeRates = (date) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      const formattedDate = new Date(date).toISOString().split("T")[0];
      try {
        const response = await RefreshToken.get("http://localhost:8081/api/exchange/rates", {
          params: { date: formattedDate },
        });
        if (Array.isArray(response.data) && response.data.length > 0) {
          setRates(response.data.map(normalizeRateData));
        } else {
          const fallback = await RefreshToken.get("http://localhost:8081/api/exchange/dbRates", {
            params: { date: formattedDate },
          });
          alert("실시간환율 정보가 없습니다. 가장 최근의 환율을 가져옵니다.");
          setRates(fallback.data.map(normalizeRateData));
        }
      } catch (err) {
        console.error("환율 로딩 실패", err);
        try {
          const fallback = await RefreshToken.get("http://localhost:8081/api/exchange/dbRates", {
            params: { date: formattedDate },
          });
          setRates(fallback.data.map(normalizeRateData));
        } catch (e) {
          console.error("DB 환율 로딩 실패", e);
          setError(e);
          setRates([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (date) fetchRates();
  }, [date]);

  return { rates, loading, error };
};

export default useExchangeRates;
