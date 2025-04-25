package com.boot.sound.deposit.scheduler;

import com.boot.sound.deposit.service.DepositAutoTransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 예금/적금 자동이체 스케줄러 클래스
 * 
 * @author 홍길동
 * @since 2024.03
 */
@Component
public class DepositAutoTransferScheduler {
    private final DepositAutoTransferService depositAutoTransferService;

    /**
     * 생성자를 통한 의존성 주입
     * 
     * @param depositAutoTransferService 자동이체 서비스
     */
    @Autowired
    public DepositAutoTransferScheduler(DepositAutoTransferService depositAutoTransferService) {
        this.depositAutoTransferService = depositAutoTransferService;
    }

    /**
     * 매일 자정에 실행되는 자동이체 처리 메서드
     * - 당일 실행 예정인 자동이체를 처리합니다.
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정에 실행
    public void processDailyAutoTransfers() {
        depositAutoTransferService.processDailyAutoTransfers();
    }

    /**
     * 매월 1일 자정에 실행되는 자동이체 처리 메서드
     * - 월 단위로 실행되는 자동이체를 처리합니다.
     */
    @Scheduled(cron = "0 0 0 1 * ?") // 매월 1일 자정에 실행
    public void processMonthlyAutoTransfers() {
        depositAutoTransferService.processMonthlyAutoTransfers();
    }

    /**
     * 매일 오전 9시에 실행되는 자동이체 실패 처리 메서드
     * - 실패한 자동이체를 재시도합니다.
     */
    @Scheduled(cron = "0 0 9 * * ?") // 매일 오전 9시에 실행
    public void retryFailedAutoTransfers() {
        depositAutoTransferService.retryFailedAutoTransfers();
    }
} 