package com.boot.sound.fund.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import javax.persistence.Column;
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
	@Column(name = "FUND_TRANSACTION_ID")
    private Integer fundTransactionId;       // PK (조회용)
	
	@Column(name = "CUSTOMER_ID")
    private String customerId;               // 고객 ID
	
	@Column(name = "FUND_ACCOUNT_ID")
    private Integer fundAccountId;           // 펀드 계좌 ID
	
	@Column(name = "WITHDRAW_ACCOUNT_NUMBER")
    private String withdrawAccountNumber;	 // 선택한 출금 계좌
	
	@Column(name = "FUND_ID")
    private Integer fundId;                  // 펀드 상품 ID
	
	@Column(name = "FUND_TRANSACTION_TYPE")
    private String fundTransactionType;      // BUY / SELL
	
	@Column(name = "FUND_INVEST_AMOUNT")
    private BigDecimal fundInvestAmount;     // 매수 or 환매 금액
	
	@Column(name = "FUND_UNITS_PURCHASED")
    private BigDecimal fundUnitsPurchased;   // 수량
    
    @Column(name = "FUND_PRICE_PER_UNIT")
    private BigDecimal fundPricePerUnit;     // 단가
    
    @Column(name = "FUND_TRANSACTION_DATE")
    private LocalDate fundTransactionDate;   // 거래일
    
    @Column(name = "FUND_CURRENT_VALUE")
    private BigDecimal fundCurrentValue;   	// 현재가격
    
    @Column(name = "STATUS")
    private String status;                   // PENDING / APPROVED / REJECTED

    @Column(name = "FUND_NAME")
    private String fundName;

    
}
