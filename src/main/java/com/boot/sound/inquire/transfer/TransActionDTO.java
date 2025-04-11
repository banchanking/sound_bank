package com.boot.sound.inquire.transfer;

//TransactionEntity.java (거래내역 테이블 매핑 엔티티)

import lombok.Data;

import javax.persistence.*;

import java.math.BigDecimal;
import java.util.Date;

@Data
@Entity
@Table(name = "TRANSACTION_TBL")
public class TransActionDTO {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 @Column(name = "TRANSACTION_ID")
 private int transaction_id; // 기본키 (거래번호)

 @Column(name = "ACCOUNT_NUMBER")
 private String account_number; // 계좌번호

 @Column(name = "TRANSACTION_TYPE")
 private String transaction_type; // 입금, 출금 등

 @Column(name = "AMOUNT")
 private BigDecimal amount; // 거래 금액

 @Column(name = "CURRENCY")
 private String currency; // 통화 (예: KRW)

 @Column(name = "COMMENT")
 private String comment; // 출금자 메모

 @Column(name = "TRANSACTION_DATE")
 @Temporal(TemporalType.TIMESTAMP)// 날짜 + 시간
 private Date transaction_date; // 거래일
 
 @Column(name = "CUSTOMER_NAME")
 private String customer_name; // 고객이름
 
 @Column(name = "ACCOUNT_TYPE")
 private String account_type; // 계좌종류
 
}


