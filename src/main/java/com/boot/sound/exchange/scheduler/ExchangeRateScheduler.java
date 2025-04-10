package com.boot.sound.exchange.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.boot.sound.exchange.ExchangeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExchangeRateScheduler {

    private final ExchangeService exchangeService;

    /**
     * 매일 오전 11시45분에 환율 저장 실행
     */
    
    @Scheduled(cron = "0 0 11 * * *") // 매일 11시45분에 한 번 (cron = 초 분 시 일 월 요일)
    public void saveExchangeRates() {
        log.info("[스케줄러] 환율 저장 시작");

        try {
            int inserted = exchangeService.saveExchangeRates();
            log.info("[스케줄러] 환율 저장 완료 - {}건 저장됨", inserted);
        } catch (Exception e) {
            log.error("[스케줄러] 환율 저장 중 오류 발생", e);
        }
    }
} 