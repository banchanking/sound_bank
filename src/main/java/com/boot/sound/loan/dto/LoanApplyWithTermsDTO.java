package com.boot.sound.loan.dto;


import lombok.Data;

@Data
public class LoanApplyWithTermsDTO {
    private LoanStatusDTO loanInfo;
    private LoanTermsAgreeDTO loanTermsAgree;
}
