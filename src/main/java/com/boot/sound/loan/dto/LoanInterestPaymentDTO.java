package com.boot.sound.loan.dto;

import lombok.Data;

import javax.persistence.*;
import java.util.Date;

@Data
@Entity
@Table(name = "loan_interest_payment_tbl")
public class LoanInterestPaymentDTO {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "INTEREST_PAYMENT_NO")
    private int interestPaymentNo;

    @Column(name = "LOAN_ID")
    private int loanId;

    @Column(name = "CUSTOMER_ID")
    private String customerId;

    @Column(name = "REPAYMENT_AMOUNT")
    private int repaymentAmount;

    @Column(name = "INTEREST_AMOUNT")
    private int interestAmount;

    @Column(name = "PRINCIPAL_AMOUNT")
    private int principalAmount;

    @Column(name = "REPAYMENT_TERM")
    private Integer repaymentTerm;

    @Column(name = "REPAYMENT_DATE")
    @Temporal(TemporalType.DATE)
    private Date repaymentDate;

    @Column(name = "ACTUAL_REPAYMENT_DATE")
    @Temporal(TemporalType.DATE)
    private Date actualRepaymentDate;

    @Column(name = "REPAYMENT_STATUS")
    private String repaymentStatus;

    @Column(name = "CREATED_AT", insertable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "UPDATED_AT", insertable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    @Transient
    private int no;
    
    @Transient
    private String loanName;
    
    @Transient
    private String accountNumber;
    
    @Override
    public String toString() {
        return "LoanInterestPaymentDTO{" +
                "loanId=" + loanId +
                ", customerId='" + customerId + '\'' +
                ", repaymentAmount=" + repaymentAmount +
                ", interestAmount=" + interestAmount +
                ", principalAmount=" + principalAmount +
                ", repaymentTerm=" + repaymentTerm +
                ", repaymentDate=" + repaymentDate +
                ", actualRepaymentDate=" + (actualRepaymentDate != null ? actualRepaymentDate : "미납 상태") +
                ", repaymentStatus='" + repaymentStatus + '\'' +
                '}';
    }
    
    
	}