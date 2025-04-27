package com.boot.sound.deposit.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DepositTransactionDTO {
    private int transactionId;
    private String accountNumber;
    private String transactionType;
    private BigDecimal amount;
    private BigDecimal balance;
    private String description;
    private LocalDateTime transactionDate;
    private String transactionStatus;
    private String referenceNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 