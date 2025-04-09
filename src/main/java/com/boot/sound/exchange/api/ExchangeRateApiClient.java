package com.boot.sound.exchange.api;

import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.boot.sound.exchange.ExchangeRateDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ExchangeRateApiClient {

    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${api-key}")
    private String apikey;
    public String getApiKey() {
       return apikey;
    }

    public List<ExchangeRateDTO> getExchangeRateDTOsForToday() {
        try {
            String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));            	

            String url = "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON"
                    + "?authkey=" + apikey
                    + "&searchdate=" + date
                    + "&data=AP01";

            String response = fetch(url);

            List<Map<String, Object>> rawList = objectMapper.readValue(
                response,
                new TypeReference<List<Map<String, Object>>>() {}
            );
            List<ExchangeRateDTO> dtoList = new ArrayList<>();

            for (Map<String, Object> map : rawList) {
                ExchangeRateDTO dto = new ExchangeRateDTO();
                dto.setCurrency_code((String) map.get("cur_unit"));
                dto.setCurrency_name((String) map.get("cur_nm"));
                dto.setBase_rate((String) map.get("deal_bas_r"));
                dto.setBuy_rate((String) map.get("tts"));
                dto.setSell_rate((String) map.get("ttb"));
                dtoList.add(dto);
            }

            return dtoList;

        } catch (Exception e) {
            throw new RuntimeException("환율 API 호출 실패", e);
        }
    }

    private String fetch(String url) throws Exception {
        try (Scanner s = new Scanner(new URL(url).openStream(), "UTF-8")) {
            return s.useDelimiter("\\A").next();
        }
    }
} 
