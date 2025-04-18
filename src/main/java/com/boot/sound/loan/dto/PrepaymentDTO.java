package com.boot.sound.loan.dto;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;

import lombok.Data;

@Data
public class PrepaymentDTO {

	private int loanStatusNo;
	private BigDecimal balance;
	private LocalDate  prepaymentDate;
	private Date loanDate;
	private BigDecimal prepayment_penalty;
	private String customerId;
	private String accountNumber;
	private int loanId;
	private int repaymentAmount;
	private int interestpaymentNo;
	
}
