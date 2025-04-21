package com.boot.sound.exchange.api;

import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import com.boot.sound.exchange.dto.ExchangeRateDTO;

import reactor.netty.http.client.HttpClient;
import reactor.util.retry.Retry;

/**
 * 환율 API 호출을 담당하는 클라이언트
 * - 리다이렉션 처리 허용
 * - 타임아웃 설정
 * - 자동 재시도 로직 포함
 */
@Component
public class ExchangeRateApiClient {

    private final WebClient webClient;
    private final String apiKey;

    public ExchangeRateApiClient(WebClient.Builder builder,
                                 @Value("${api-key}") String apiKey) {
        this.apiKey = apiKey;
        HttpClient httpClient = HttpClient.create()
            .followRedirect(true)
            .responseTimeout(Duration.ofSeconds(10))
            .option(io.netty.channel.ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000);

        this.webClient = builder
            .baseUrl("https://www.koreaexim.go.kr")
            .defaultHeader(HttpHeaders.USER_AGENT, "Mozilla/5.0 (Java)")
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();
    }

    /**
     * 오늘 날짜 기준으로 환율 JSON을 호출해 DTO 리스트로 반환
     * 실패 시 최대 3회 재시도
     */
    public List<ExchangeRateDTO> getExchangeRateDTOsForToday() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        List<Map<String,Object>> rawList = webClient.get()
            .uri(uri -> uri
                .path("/site/program/financial/exchangeJSON")
                .queryParam("authkey", apiKey)
                .queryParam("searchdate", date)
                .queryParam("data", "AP01")
                .build())
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<List<Map<String,Object>>>() {})
            .retryWhen(Retry.fixedDelay(3, Duration.ofSeconds(2)))
            .block();

        return rawList.stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    private ExchangeRateDTO mapToDto(Map<String,Object> m) {
        ExchangeRateDTO dto = new ExchangeRateDTO();
        dto.setCurrency_code((String) m.get("cur_unit"));
        dto.setCurrency_name((String) m.get("cur_nm"));
        dto.setBase_rate((String) m.get("deal_bas_r"));  // 중간환율

        // TTB → 은행이 외화를 사는 가격 → 고객이 팔 때 받는 가격 → buy_rate
        dto.setBuy_rate((String) m.get("ttb"));

        // TTS → 은행이 외화를 파는 가격 → 고객이 살 때 내는 가격 → sell_rate
        dto.setSell_rate((String) m.get("tts"));

        return dto;
    }

}
