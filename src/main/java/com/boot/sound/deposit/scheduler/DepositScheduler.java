package com.boot.sound.deposit.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.boot.sound.deposit.service.DepositService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DepositScheduler {
    
    private final DepositService depositService;

    // 매일 자정에 자동이체 처리
    @Scheduled(cron = "0 0 0 * * *")
    public void processAutoTransfers() {
        depositService.processAutoTransfers();
    }

    // 매일 자정에 적금 만기 처리
    @Scheduled(cron = "0 0 0 * * *")
    public void processMaturity() {
        depositService.processMaturity();
    }

    // 매월 1일 자정에 이자 지급
    @Scheduled(cron = "0 0 0 1 * *")
    public void payInterest() {
        depositService.payInterest();
    }
} 