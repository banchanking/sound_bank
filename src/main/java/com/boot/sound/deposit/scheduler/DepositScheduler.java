package com.boot.sound.deposit.scheduler;


import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.boot.sound.deposit.service.DepositAutoTransferService;

@Component
@RequiredArgsConstructor
public class DepositScheduler {

    private final DepositAutoTransferService autoTransferService;

   
    // 매일 새벽 2시에 자동이체 실행
    @Scheduled(cron = "10 44 21 * * ?")
    public void runAutoTransfers() {
        autoTransferService.processTodayAutoTransfers();
    }
    
    
}
