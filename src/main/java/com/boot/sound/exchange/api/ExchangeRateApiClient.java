package com.boot.sound.exchange.api;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.client.LaxRedirectStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.boot.sound.exchange.dto.ExchangeRateDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ExchangeRateApiClient {
    private static final Logger log = LoggerFactory.getLogger(ExchangeRateApiClient.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${api-key}")
    private String apikey;

    public ExchangeRateApiClient() {
        // 1. HTTP client에 브라우저 User‑Agent 지정
        // 2. LaxRedirectStrategy로 301/302 리다이렉트 자동 추적
        RequestConfig config = RequestConfig.custom()
            .setConnectTimeout(5_000)
            .setSocketTimeout(5_000)
            .build();

        CloseableHttpClient httpClient = HttpClients.custom()
            .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
            .setDefaultRequestConfig(config)
            .setRedirectStrategy(new LaxRedirectStrategy())
            .build();

        this.restTemplate = new RestTemplate(
            new HttpComponentsClientHttpRequestFactory(httpClient)
        );
    }

    public List<ExchangeRateDTO> getExchangeRateDTOsForToday() {
        String url = buildUrl();
        String body = callApiWithRetry(url, 3, 1_000);

        try {
            List<Map<String, Object>> raw = objectMapper.readValue(
                body, new TypeReference<List<Map<String, Object>>>() {}
            );
            List<ExchangeRateDTO> list = new ArrayList<>();
            for (Map<String, Object> m : raw) {
                ExchangeRateDTO dto = new ExchangeRateDTO();
                dto.setCurrency_code((String) m.get("cur_unit"));
                dto.setCurrency_name((String) m.get("cur_nm"));
                dto.setBase_rate((String) m.get("deal_bas_r"));
                dto.setBuy_rate((String) m.get("ttb"));
                dto.setSell_rate((String) m.get("tts"));
                list.add(dto);
            }
            return list;
        } catch (Exception e) {
            throw new RuntimeException("환율 응답 파싱 실패", e);
        }
    }

    private String callApiWithRetry(String url, int maxTries, long delayMs) {
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
        headers.set(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        HttpEntity<Void> req = new HttpEntity<>(headers);

        String resp = null;
        for (int i = 1; i <= maxTries; i++) {
            try {
                ResponseEntity<String> r = restTemplate.exchange(url, HttpMethod.GET, req, String.class);
                resp = r.getBody();
                if (resp != null && !resp.trim().isEmpty() && !"[]".equals(resp.trim())) {
                    log.info("환율 API 성공 ({}회차)", i);
                    return resp;
                }
                log.warn("빈 또는 유효하지 않은 응답, 재시도 {}/{}", i, maxTries);
            } catch (Exception ex) {
                log.error("환율 API 예외, 재시도 {}/{}", i, maxTries, ex);
            }
            try { Thread.sleep(delayMs); } catch (InterruptedException ignored) {}
        }

        throw new RuntimeException("환율 API 호출 실패: 최대 재시도(" + maxTries + "회) 후에도 응답 획득 불가");
    }

    private String buildUrl() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        return "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON"
             + "?authkey=" + apikey
             + "&searchdate=" + date
             + "&data=AP01";
    }
}
