package com.boot.sound.deposit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DepositDTO {
    // 공통 필드
    private int id;
    private int accountId;
    private String customerId;
    private int productId;
    private String accountNumber;
    private String accountPassword;
    private BigDecimal balance;
    private BigDecimal interestRate;
    private String accountStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String nickname;

    // 상품 관련 필드
    private String productName;
    private String productType;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private int termMonths;
    private String productDescription;

    // 예금 계좌 필드
    private boolean autoTransferEnabled;
    private BigDecimal autoTransferAmount;
    private Integer autoTransferDay;

    // 적금 계좌 필드
    private BigDecimal monthlyAmount;
    private LocalDate maturityDate;

    // 거래 내역 필드
    private String transactionType;
    private LocalDateTime transactionDate;
    private BigDecimal transactionAmount;
    private String transactionDescription;

    // 비밀번호 변경 관련 필드
    private String oldPassword;
    private String newPassword;
    
    // 출금용 계좌번호 (초기 입금할 때 사용)
    private String withdrawalAccountNumber;



} 