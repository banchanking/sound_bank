package com.boot.sound.fund.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fund_transaction_tbl")
public class FundTransactionDTO {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer fundTransactionId;       // PK (조회용)
	
    private String customerId;               // 고객 ID
    private Integer fundAccountId;           // 펀드 계좌 ID
    private String withdrawAccountNumber;	 // 선택한 출금 계좌
    private Integer fundId;                  // 펀드 상품 ID
    private String fundTransactionType;      // BUY / SELL
    private BigDecimal fundInvestAmount;     // 매수 or 환매 금액
    private BigDecimal fundUnitsPurchased;   // 수량
    private BigDecimal fundPricePerUnit;     // 단가
    private LocalDate fundTransactionDate;   // 거래일
    private String status;                   // PENDING / APPROVED / REJECTED

}
