package com.boot.sound.deposit.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class DepositTransactionDTO {
    private int transactionId;      // 거래번호
    private int datId;              // 예금번호
    private String transactionType; // 거래구분 (입금/출금)
    private BigDecimal amount;      // 거래금액
    private BigDecimal balance;     // 잔액
    private String description;     // 거래내용
    private String branch;          // 거래점
    private Date transactionDate;   // 거래일시
} 