package com.boot.sound.loan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Date;

@Entity
@Table(name = "loan_status_tbl")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanStatusDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loan_status_no")
    private int loanStatusNo;

    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Column(name = "loan_id", nullable = false)
    private int loanId;

    @Column(name = "loan_name")
    private String loanName;

    @Column(name = "interest_rate")
    private float interestRate;

    @Column(name = "customer_income")
    private int customerIncome;

    @Column(name = "customer_credit_score")
    private String customerCreditScore;

    @Column(name = "loan_amount")
    private int loanAmount;

    @Column(name = "balance")
    private BigDecimal balance;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "repayment_method")
    private String repaymentMethod;

    @Column(name = "repayment_date")
    private String repaymentDate;

    @Column(name = "loan_type")
    private String loanType;

    @Column(name = "loan_progress")
    private String loanProgress;

    @Column(name = "loan_date")
    private Date loanDate;

    @Column(name = "loan_term")
    private int loanTerm;

    @Column(name = "remaining_term")
    private int remainingTerm;
    
    @Transient
    private int no;
    
    private BigDecimal prepayment_penalty; 

} 
