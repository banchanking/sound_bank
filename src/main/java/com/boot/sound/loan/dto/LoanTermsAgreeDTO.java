package com.boot.sound.loan.dto;

import java.sql.Date;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "loan_terms_agree_tbl")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanTermsAgreeDTO {

	@Id
	private int agree_id;
	private int term_id;
	private String customer_id;
	private int loan_id;
	private Date agreed_at;
}
