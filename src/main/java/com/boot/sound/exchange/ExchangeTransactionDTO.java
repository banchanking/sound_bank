package com.boot.sound.exchange;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDateTime;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "exchange_transaction")
public class ExchangeTransactionDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("exchange_transaction_id")
    private Long exchange_transaction_id;  // 거래 ID (PK)

    @JsonProperty("customer_id")
    private String customer_id;            // 고객 ID (FK)

    @JsonProperty("withdraw_account_number")
    private String withdraw_account_number; // 출금 계좌 번호 (FK)

    @JsonProperty("request_amount")
    private BigDecimal request_amount;     // 요청한 원화 금액

    @JsonProperty("exchanged_amount")
    private BigDecimal exchanged_amount;   // 환전된 외화 금액

    @JsonProperty("exchange_rate")
    private BigDecimal exchange_rate;      // 적용 환율

    @JsonProperty("exchange_transaction_date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime exchange_transaction_date; // 거래 일시

    @JsonProperty("currency_code")
    private String currency_code;          // 환전 대상 통화 코드 (예: USD)

    @JsonProperty("base_date")
    private Date base_date;                // 환율 기준일 (환율 테이블과 FK 연결)
    
    @JsonProperty("transaction_type")
    private String transaction_type; // "buy" or "sell"
}

//-- 지갑 충전(환전)
//drop table exchange_transaction;
//CREATE TABLE exchange_transaction (
//  EXCHANGE_TRANSACTION_ID BIGINT AUTO_INCREMENT PRIMARY KEY,           -- 거래 ID
//  CUSTOMER_ID VARCHAR(20) NOT NULL,                  -- 고객 ID
//  WITHDRAW_ACCOUNT_NUMBER VARCHAR(20) NOT NULL,      -- 출금 계좌번호
//  TO_CURRENCY VARCHAR(10) NOT NULL,                  -- 변환할 통화 ex)USD
//  REQUEST_AMOUNT DECIMAL(18,2) NOT NULL,             -- 충전 금액(원)
//  EXCHANGED_AMOUNT DECIMAL(18,2) NOT NULL,           -- 환전된 외화 금액
//  EXCHANGE_RATE DECIMAL(10,4) NOT NULL,              -- 적용 환율 
//  EXCHANGE_TRANSACTION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,       -- 거래 일시
//
//  -- FK 연결
//  CONSTRAINT fk_tx_customer FOREIGN KEY (CUSTOMER_ID)
//    REFERENCES customer_tbl(customer_id) ON DELETE CASCADE,
//
//  CONSTRAINT fk_tx_account FOREIGN KEY (WITHDRAW_ACCOUNT_NUMBER)
//    REFERENCES account_tbl(account_number) ON DELETE CASCADE
//);
