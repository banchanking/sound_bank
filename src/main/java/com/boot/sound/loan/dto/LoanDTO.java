package com.boot.sound.loan.dto;

import java.math.BigDecimal;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name="LOAN_TBL")
public class LoanDTO {
	
	@Id
	private int loan_id;
	private String loan_name;
	private int loan_min_amount;
	private int loan_max_amount;
	@Column(precision = 5, scale = 2)
	private BigDecimal   interest_rate;
	private int loan_term;
	private String loan_info;
	private String loan_type;
}
