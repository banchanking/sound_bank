package com.boot.sound.deposit.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DepositAccountDTO {
    private int datId;              // 예금번호
    private String customerId;      // 고객ID
    private int productId;          // 상품ID
    private String accountNumber;   // 계좌번호
    private String accountPassword; // 계좌비밀번호
    private BigDecimal balance;     // 잔액
    private BigDecimal interestRate; // 이자율
    private String accountStatus;   // 계좌상태
    private boolean autoTransferEnabled; // 자동이체 활성화 여부
    private BigDecimal autoTransferAmount; // 자동이체 금액
    private Integer autoTransferDay; // 자동이체 일자
    private LocalDateTime createdAt; // 생성일시
    private LocalDateTime updatedAt; // 수정일시
} 