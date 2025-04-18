package com.boot.sound.loan.dto;

import lombok.Data;

@Data
public class LateInterestDTO {
    private int latePaymentNo;
    private int loanId;
    private String customerId;
    private int unpaidAmount;
    private String repaymentStatus;
    private int overdueInterest;
    private int interestPaymentNo;
}