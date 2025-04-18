package com.boot.sound.loan.dto;

import lombok.Data;

@Data
public class LoanLatePaymentDTO {
	private int latePaymentNo;
    private int loanId;
    private String customerId;
    private int unpaidAmount;
    private String repaymentStatus;
    private int overdueInterest;
}