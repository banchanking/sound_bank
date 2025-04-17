package com.boot.sound.loan.dto;

import lombok.Data;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Date;

@Data
@Entity
@Table(name = "prepayment_tbl")
public class PrepaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "prepayment_no")
    private int prepaymentNo;

    @Column(name = "loan_status_no", nullable = false)
    private int loanStatusNo;

    @Column(name = "customer_id", nullable = false, length = 50)
    private String customerId;

    @Column(name = "repayment_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal repaymentAmount;

    @Column(name = "penalty_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal penaltyAmount;

    @Column(name = "total_deducted_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalDeductedAmount;

    @Column(name = "repayment_date", nullable = false)
    private Date repaymentDate;

    @Column(name = "account_number", nullable = false, length = 30)
    private String accountNumber;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "완료";

   
}