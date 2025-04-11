package com.boot.sound.loan.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class LoanStatusRequestDTO {

    @JsonProperty("loan_status_no")
    private int loanStatusNo;

    @JsonProperty("loan_name")
    private String loanName;

    @JsonProperty("loan_id")
    private int loanId;

    @JsonProperty("interest_rate")
    private float interestRate;

    @JsonProperty("customer_id")
    private String customerId;

    @JsonProperty("customer_income")
    private int customerIncome;

    @JsonProperty("customer_credit_score")
    private String customerCreditScore;

    @JsonProperty("loan_amount")
    private int loanAmount;

    @JsonProperty("balance")
    private int balance;

    @JsonProperty("account_number")
    private String accountNumber;

    @JsonProperty("repayment_method")
    private String repaymentMethod;

    @JsonProperty("repayment_date")
    private String repaymentDate;

    @JsonProperty("loan_type")
    private String loanType;

    @JsonProperty("loan_progress")
    private String loanProgress;

    @JsonProperty("loan_term")
    private int loanTerm;

    @JsonProperty("remaining_term")
    private int remainingTerm;
}
