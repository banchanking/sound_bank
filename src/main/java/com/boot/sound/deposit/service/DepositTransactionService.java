package com.boot.sound.deposit.service;

import com.boot.sound.deposit.dao.DepositAccountDAO;
import com.boot.sound.deposit.dao.DepositTransactionDAO;
import com.boot.sound.deposit.dto.DepositAccountDTO;
import com.boot.sound.deposit.dto.DepositTransactionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
public class DepositTransactionService {
    
    @Autowired
    private DepositTransactionDAO depositTransactionDAO;
    
    @Autowired
    private DepositAccountDAO depositAccountDAO;
    
    // 거래내역 조회
    public List<DepositTransactionDTO> getTransactionsByAccount(int datId, Date startDate, Date endDate) {
        return depositTransactionDAO.findTransactionsByAccount(datId, startDate, endDate);
    }
    
    // 입금 처리
    @Transactional
    public int deposit(DepositTransactionDTO transaction) {
        // 계좌 정보 조회
        DepositAccountDTO account = depositAccountDAO.findAccountById(transaction.getDatId());
        if (account == null) {
            throw new RuntimeException("계좌가 존재하지 않습니다.");
        }
        
        // 잔액 업데이트
        BigDecimal newBalance = account.getBalance().add(transaction.getAmount());
        depositTransactionDAO.updateAccountBalance(transaction.getDatId(), newBalance);
        
        // 거래내역 생성
        transaction.setBalance(newBalance);
        return depositTransactionDAO.createTransaction(transaction);
    }
    
    // 출금 처리
    @Transactional
    public int withdraw(DepositTransactionDTO transaction) {
        // 계좌 정보 조회
        DepositAccountDTO account = depositAccountDAO.findAccountById(transaction.getDatId());
        if (account == null) {
            throw new RuntimeException("계좌가 존재하지 않습니다.");
        }
        
        // 잔액 확인
        if (account.getBalance().compareTo(transaction.getAmount()) < 0) {
            throw new RuntimeException("잔액이 부족합니다.");
        }
        
        // 잔액 업데이트
        BigDecimal newBalance = account.getBalance().subtract(transaction.getAmount());
        depositTransactionDAO.updateAccountBalance(transaction.getDatId(), newBalance);
        
        // 거래내역 생성
        transaction.setBalance(newBalance);
        return depositTransactionDAO.createTransaction(transaction);
    }
} 