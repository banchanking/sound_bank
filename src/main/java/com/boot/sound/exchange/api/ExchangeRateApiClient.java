package com.boot.sound.exchange.api;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.boot.sound.exchange.dto.ExchangeRateDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ExchangeRateApiClient {
    private static final Logger log = LoggerFactory.getLogger(ExchangeRateApiClient.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${api-key}")
    private String apikey;

    public String getApiKey() {
        return apikey;
    }

    public List<ExchangeRateDTO> getExchangeRateDTOsForToday() {
        String url = buildUrl();
        String response = null;

        int maxRetries = 3;
        long delayMs = 1000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                response = restTemplate.getForObject(url, String.class);
                if (response != null) {
                    String trimmed = response.trim();
                    if (!trimmed.isEmpty() && !"[]".equals(trimmed)) {
                        log.info("환율 API 응답 성공 ({}회차)", attempt);
                        break;
                    }
                }
                log.warn("빈 또는 잘못된 응답—재시도 중... ({}회차/{})", attempt, maxRetries);
            } catch (Exception e) {
                log.error("환율 API 호출 예외—재시도 중... ({}회차/{})", attempt, maxRetries, e);
            }

            try {
                Thread.sleep(delayMs);
            } catch (InterruptedException ignored) {}
        }

        if (response == null || response.trim().isEmpty() || "[]".equals(response.trim())) {
            throw new RuntimeException("환율 API 호출 실패: 최대 재시도(" + maxRetries + "회) 후에도 유효한 응답이 없습니다.");
        }

        try {
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
            throw new RuntimeException("환율 응답 파싱 실패", e);
        }
    }

    private String buildUrl() {
        String date = LocalDate.now()
            .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON"
             + "?authkey=" + apikey
             + "&searchdate=" + date
             + "&data=AP01";
    }
}
