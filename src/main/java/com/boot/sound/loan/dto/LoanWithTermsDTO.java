package com.boot.sound.loan.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class LoanWithTermsDTO {
	
		private String loan_name;
	    private int loan_min_amount;
	    private int loan_max_amount;
	    private BigDecimal interest_rate;
	    private int loan_term;
	    private String loan_info;
	    private String loan_type;
	    private BigDecimal prepayment_penalty;
	    private String term_title;
	    private String term_content;

}
