package com.boot.sound.loan.dto;

import java.math.BigDecimal;

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
@Table(name="loan_terms_tbl")
public class LoanTermDTO {
	
	@Id
	private int term_id;
	private int loan_id;
	private String term_title;
	private String term_content;
}
