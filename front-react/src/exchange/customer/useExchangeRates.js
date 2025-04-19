import { useState, useEffect } from "react";
import RefreshToken from "../../jwt/RefreshToken";

const normalizeRateData = (item) => {
  if (item.cur_unit) {
    return {
      currency_code: item.cur_unit,
      currency_name: item.cur_nm,
      base_rate: parseFloat(item.deal_bas_r.replace(",", "")),
      buy_rate: parseFloat(item.tts.replace(",", "")),
      sell_rate: parseFloat(item.ttb.replace(",", "")),
    };
  } else {
    return {
      currency_code: item.CURRENCY_CODE,
      currency_name: item.CURRENCY_NAME,
      base_rate: parseFloat(item.BASE_RATE),
      buy_rate: parseFloat(item.BUY_RATE),
      sell_rate: parseFloat(item.SELL_RATE),
      fee_rate: parseFloat(item.FEE_RATE),
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
        const response = await RefreshToken.get("http://localhost:8081/api/exchange/dbRates", {
          params: { date: formattedDate },
        });

        if (response.data.alert) {
          alert(response.data.alert);
        }

        if (response.data.rates) {
          setRates(response.data.rates.map(normalizeRateData));
        } else {
          setRates(response.data.map(normalizeRateData));
        }
      } catch (err) {
        console.error("DB 환율 로딩 실패", err);
        setError(err);
        setRates([]);
      } finally {
        setLoading(false);
      }
    };

    if (date) fetchRates();
  }, [date]);

  return { rates, loading, error };
};

export default useExchangeRates;
