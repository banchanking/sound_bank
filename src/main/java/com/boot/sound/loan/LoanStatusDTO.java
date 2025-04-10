package com.boot.sound.loan;

import java.sql.Date;

import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@Table(name="LOAN_STATUS_TBL")
public class LoanStatusDTO {
	@Id
	private int loan_status_no;
	private String loan_name;
	private int loan_id;
	private float interest_rate;
	private String customer_id;
	private int customer_income;
	private String customer_credit_score;
	private int loan_amount;
	private int balance;
	private String account_number;
	private String repayment_method;
	private String repayment_date;
	private String loan_type;
	private String loan_progress;
	private Date loan_date;
}
