package com.boot.sound.deposit.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DepositDTO {

    // 상품 관련
    private int productId; // 상품 ID
    private String productName; // 상품명
    private String productDescription; // 상품 설명
    private BigDecimal interestRate; // 이자율
    private int termMonths; // 기간 (개월)

    // 계좌 관련
    private String accountNumber; // 계좌 번호
    private String accountPassword; // 계좌 비밀번호
    private BigDecimal balance; // 잔액
    private String accountStatus; // 계좌 상태 (ACTIVE, CLOSED 등)
    private BigDecimal amount;  // 금액

    // 거래 관련
    private String transactionType; // 거래 유형 (DEPOSIT, WITHDRAW 등)
    private BigDecimal transactionAmount; // 거래 금액
    private LocalDateTime transactionDate; // 거래 일자
    private String transactionDescription; // 거래 설명
    
    private String nickname; // 계좌 별명
    private boolean autoTransferEnabled; // 자동이체 설정 여부
    private BigDecimal autoTransferAmount; // 자동이체 금액
    private int autoTransferDay; // 자동이체 일자
    private String oldPassword; // 기존 비밀번호 (비번 변경시)
    private String newPassword; // 새 비밀번호
    private BigDecimal monthlyAmount; // 적금 월 납입금
    private LocalDate maturityDate;; // 적금 만기일
    private String customerId; // 고객 ID (계좌 생성용)
    private int id; // 계좌, 상품 ID
    private int accountId;
    private String withdrawalAccountNumber;
    private Integer satId; // 적금 계좌 ID
    
    private String productType;           // 상품 유형
    private BigDecimal minAmount;         // 최소 금액
    private BigDecimal maxAmount;         // 최대 금액
    
    private String accountType;    // 계좌 유형


    
    
    

}