package com.boot.sound.deposit.scheduler;


import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.boot.sound.deposit.service.DepositAutoTransferService;

/**
 * DepositScheduler
 * 매일 자동으로 자동이체를 실행하는 스케줄러
 */
@Component
@RequiredArgsConstructor
public class DepositScheduler {

    private final DepositAutoTransferService autoTransferService;

    /**
     * 매일 새벽 2시에 자동이체 실행
     */
    @Scheduled(cron = "* * 2 * * *")
    public void runAutoTransfers() {
        autoTransferService.processTodayAutoTransfers();
    }
    
    
}
