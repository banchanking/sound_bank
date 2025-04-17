package com.boot.sound.loan.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class LoanCustomerDTO {

	private String customer_id;
	private String account_number;
	private int loan_id;
	private String loan_name;
	private int loan_min_amount;
	private int loan_max_amount;
	private float interest_rate;
	private int loan_term;
	private String loan_type;
	private String accountNumbers;
	
}
