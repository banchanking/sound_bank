package com.boot.sound.exchange.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Table(name="exchange_wallet")
public class ExchangeWalletDTO {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "WALLET_ID")
    private long wallet_id;
    
    @Column(name = "CUSTOMER_ID")
    private String customer_id; // 고객 ID
    
    @Column(name = "currency_code")
    private String currency_code; // 통화 코드 (예: KRW, USD 등)
    
    @Column(name = "BALANCE")
    private BigDecimal balance; // 잔액 소수점
    
    @Column(name = "CREATED_AT")
    private Timestamp created_at; // 생성일
    
    @Column(name = "UPDATED_AT")
    private Timestamp updated_at; // 수정일
    
    @Column(name = "STATUS")
    private String status; // 상태 (ACTIVE, INACTIVE)
    
    @JsonProperty("transaction_type")
    private String transaction_type; // "buy" or "sell"

    // 평균 매입 환율 (exchange_transaction + exchange_rate 기준, DB에는 존재하지 않음)
    @JsonProperty("average_rate")
    @Column(name = "average_rate")
    private BigDecimal average_rate;

}
// -- soundbank.exchange_wallet definition

// CREATE TABLE `exchange_wallet` (
//   `WALLET_ID` bigint(20) NOT NULL AUTO_INCREMENT,
//   `CUSTOMER_ID` varchar(20) NOT NULL,
//   `CURRENCY_CODE` varchar(10) NOT NULL,
//   `BALANCE` decimal(18,2) DEFAULT 0.00,
//   `CREATED_AT` timestamp NULL DEFAULT current_timestamp(),
//   `UPDATED_AT` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
//   `STATUS` varchar(20) NOT NULL DEFAULT 'ACTIVE',
//   PRIMARY KEY (`WALLET_ID`),
//   UNIQUE KEY `uq_customer_currency` (`CUSTOMER_ID`,`CURRENCY_CODE`),
//   CONSTRAINT `fk_wallet_customer` FOREIGN KEY (`CUSTOMER_ID`) REFERENCES `customer_tbl` (`CUSTOMER_ID`) ON DELETE CASCADE
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;