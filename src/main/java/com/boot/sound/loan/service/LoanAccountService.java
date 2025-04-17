package com.boot.sound.loan.service;

import com.boot.sound.inquire.transfer.TransActionDTO;
import com.boot.sound.loan.dao.LoanDAO;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class LoanAccountService {

    private final LoanDAO loanDAO;

   
    public void saveLoanTransaction(String accountNumber,
                                    String transactionType,
                                    BigDecimal amount,
                                    String currency,
                                    String comment,
                                    String customerName,
                                    String accountType) {
        TransActionDTO tx = new TransActionDTO();
        tx.setAccount_number(accountNumber);
        tx.setTransaction_type(transactionType); // 예: "출금"
        tx.setAmount(amount);
        tx.setCurrency(currency);                // "KRW"
        tx.setComment(comment);                 // 예: "대출 원리금 상환"
        tx.setCustomer_name(customerName);
        tx.setAccount_type(accountType);

        loanDAO.insertTransaction(accountNumber, transactionType, amount, currency, comment, customerName, accountType);
    }
}
