package com.boot.sound.deposit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DepositAutoTransferDTO {
    
    private int id;                 // 자동이체 PK (auto_transfer_id)
    private int datId;              // 예금계좌 PK (dat_id)
    private String targetAccountNumber; // 이체 대상 계좌번호
    private BigDecimal transferAmount;  // 이체 금액
    private int transferDay;        // 매월 이체일 (1~28)
    private String transferStatus;  // 상태 (ACTIVE, INACTIVE)
    
    private LocalDateTime createdAt; // 생성일
    private LocalDateTime updatedAt; // 수정일

    // (필요 시 추가 가능)
}
