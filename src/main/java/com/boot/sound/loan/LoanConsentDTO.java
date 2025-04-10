package com.boot.sound.loan;

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
@Table(name="LOAN_AGREE_STATUS_TBL")
public class LoanConsentDTO {
	
	@Id
	private int agree_status_id;
	private int loan_id;
	@Column(name = "CUSTOMER_ID", nullable = false, length = 20)
	private String customerId;
	private String consent_use1;
	private String consent_use2;
	private String consent_use3;
	private String consent_use4;
	private String consent_view1;
	private String consent_view2;
	private String consent_view3;
	private String consent_view4;
	
	
}
