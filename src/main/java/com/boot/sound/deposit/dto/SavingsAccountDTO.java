package com.boot.sound.deposit.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SavingsAccountDTO {
    private int satId;              // 적금번호
    private String customerId;      // 고객ID
    private int productId;          // 상품ID
    private String accountNumber;   // 계좌번호
    private String accountPassword; // 계좌비밀번호
    private BigDecimal balance;     // 잔액
    private BigDecimal interestRate; // 이자율
    private String accountStatus;   // 계좌상태
    private BigDecimal monthlyAmount; // 월 납입금액
    private LocalDate maturityDate; // 만기일
    private LocalDateTime createdAt; // 생성일시
    private LocalDateTime updatedAt; // 수정일시
} 