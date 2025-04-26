package com.boot.sound.deposit.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.deposit.dao.DepositTransactionDAO;
import com.boot.sound.deposit.dto.DepositTransactionDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepositTransactionService {
    
    private final DepositTransactionDAO depositTransactionDAO;

    // 예금 거래 내역 조회
    public List<DepositTransactionDTO> getDepositTransactions(String accountNumber, String startDate, String endDate) {
        return depositTransactionDAO.getDepositTransactions(accountNumber, startDate, endDate);
    }

    // 적금 거래 내역 조회
    public List<DepositTransactionDTO> getSavingsTransactions(String accountNumber, String startDate, String endDate) {
        return depositTransactionDAO.getSavingsTransactions(accountNumber, startDate, endDate);
    }

    // 예금 거래 내역 상세 조회
    public DepositTransactionDTO getDepositTransactionDetail(int transactionId) {
        return depositTransactionDAO.getDepositTransactionDetail(transactionId);
    }

    // 적금 거래 내역 상세 조회
    public DepositTransactionDTO getSavingsTransactionDetail(int transactionId) {
        return depositTransactionDAO.getSavingsTransactionDetail(transactionId);
    }

    // 예금 입금 처리
    @Transactional
    public int deposit(DepositTransactionDTO transaction) {
        // 거래 내역 생성
        int result = depositTransactionDAO.createDepositTransaction(transaction);
        
        // 계좌 잔액 업데이트
        if (result > 0) {
            BigDecimal newBalance = transaction.getBalance().add(transaction.getAmount());
            depositTransactionDAO.updateDepositAccountBalance(transaction.getAccountNumber(), newBalance);
        }
        
        return result;
    }

    // 예금 출금 처리
    @Transactional
    public int withdraw(DepositTransactionDTO transaction) {
        // 잔액 확인
        DepositTransactionDTO lastTransaction = getDepositTransactionDetail(transaction.getTransactionId());
        if (lastTransaction == null || lastTransaction.getBalance().compareTo(transaction.getAmount()) < 0) {
            throw new RuntimeException("잔액이 부족합니다.");
        }
        
        // 거래 내역 생성
        int result = depositTransactionDAO.createDepositTransaction(transaction);
        
        // 계좌 잔액 업데이트
        if (result > 0) {
            BigDecimal newBalance = transaction.getBalance().subtract(transaction.getAmount());
            depositTransactionDAO.updateDepositAccountBalance(transaction.getAccountNumber(), newBalance);
        }
        
        return result;
    }

    // 적금 입금 처리
    @Transactional
    public int savingsDeposit(DepositTransactionDTO transaction) {
        // 거래 내역 생성
        int result = depositTransactionDAO.createSavingsTransaction(transaction);
        
        // 계좌 잔액 업데이트
        if (result > 0) {
            BigDecimal newBalance = transaction.getBalance().add(transaction.getAmount());
            depositTransactionDAO.updateSavingsAccountBalance(transaction.getAccountNumber(), newBalance);
        }
        
        return result;
    }
} 