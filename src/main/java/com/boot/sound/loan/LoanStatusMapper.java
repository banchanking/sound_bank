package com.boot.sound.loan;

import com.boot.sound.loan.dto.LoanStatusDTO;
import com.boot.sound.loan.dto.LoanStatusRequestDTO;

public class LoanStatusMapper {

    public static LoanStatusDTO toEntity(LoanStatusRequestDTO dto) {
        return LoanStatusDTO.builder()
                .loanStatusNo(dto.getLoanStatusNo())
                .loanName(dto.getLoanName())
                .loanId(dto.getLoanId())
                .interestRate(dto.getInterestRate())
                .customerId(dto.getCustomerId())
                .customerIncome(dto.getCustomerIncome())
                .customerCreditScore(dto.getCustomerCreditScore())
                .loanAmount(dto.getLoanAmount())
                .balance(java.math.BigDecimal.valueOf(dto.getBalance()))
                .accountNumber(dto.getAccountNumber())
                .repaymentMethod(dto.getRepaymentMethod())
                .repaymentDate(dto.getRepaymentDate())
                .loanType(dto.getLoanType())
                .loanProgress(dto.getLoanProgress())
                .loanTerm(dto.getLoanTerm())
                .remainingTerm(dto.getRemainingTerm())
                .build();
    }

}
