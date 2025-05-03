package com.boot.sound.deposit.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.deposit.dao.DepositTransactionDAO;
import com.boot.sound.deposit.dto.DepositDTO;
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
        // 계좌 현재 잔액 가져오기
        BigDecimal currentBalance = depositTransactionDAO.getDepositAccountBalance(transaction.getAccountNumber());

        if (currentBalance == null || currentBalance.compareTo(transaction.getAmount()) < 0) {
            throw new RuntimeException("잔액이 부족합니다.");
        }
        
        // 거래 내역 생성
        int result = depositTransactionDAO.createDepositTransaction(transaction);
        
        // 계좌 잔액 업데이트
        if (result > 0) {
            BigDecimal newBalance = currentBalance.subtract(transaction.getAmount());
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
    
    // 적금 출금 처리
    @Transactional
    public int savingsWithdraw(DepositTransactionDTO transaction) {
        // 계좌 현재 잔액 가져오기
        BigDecimal currentBalance = depositTransactionDAO.getSavingsAccountBalance(transaction.getAccountNumber());

        if (currentBalance == null || currentBalance.compareTo(transaction.getAmount()) < 0) {
            throw new RuntimeException("잔액이 부족합니다.");
        }
        
        // 거래 내역 생성
        int result = depositTransactionDAO.createSavingsTransaction(transaction);
        
        // 계좌 잔액 업데이트
        if (result > 0) {
            BigDecimal newBalance = currentBalance.subtract(transaction.getAmount());
            depositTransactionDAO.updateSavingsAccountBalance(transaction.getAccountNumber(), newBalance);
        }
        
        return result;
    }
    
    // 예금 계좌 해지 처리
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void closeDepositAccount(DepositTransactionDTO dto) {      

        DepositTransactionDTO account = depositTransactionDAO.getDepositAccountDetailByAccountNumber(dto.getAccountNumber());



        if (account == null) {
            throw new RuntimeException("계좌 정보를 찾을 수 없습니다.");
        }
  

        if (account.getAccountPassword() == null || account.getAccountPassword().isBlank()) {
            throw new RuntimeException("계좌에 저장된 비밀번호 정보가 없습니다.");
        }

        if (!passwordEncoder.matches(dto.getAccountPassword(), account.getAccountPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }


        int result = depositTransactionDAO.closeDepositAccount(dto.getAccountNumber());


        if (result != 1) {
            throw new RuntimeException("계좌 해지 실패.");
        }

        String basicAccountNumber = depositTransactionDAO.findBasicAccountNumberByCustomer(dto.getCustomerId());

        if (basicAccountNumber == null) {
            throw new RuntimeException("기본 계좌가 존재하지 않습니다.");
        }

        BigDecimal amount = account.getBalance();

        depositTransactionDAO.depositToBasicAccount(basicAccountNumber, amount);

        DepositTransactionDTO tx = new DepositTransactionDTO();
        tx.setAccountNumber(basicAccountNumber);
        tx.setTransactionType("입금");
        tx.setAmount(amount); 
        tx.setTransactionDescription("예금 해지로 인한 입금");
        tx.setCustomerId(dto.getCustomerId());
        tx.setCustomerName(dto.getCustomerId());
        tx.setAccountType("BASIC");

        depositTransactionDAO.insertBasicTransaction(tx);
        System.out.println("▶▶▶ 거래내역 insert 완료");
    }

    // 적금 계좌 해지 처리
    @Transactional
    public void closeSavingsAccount(DepositTransactionDTO dto) {
        // 1. 계좌 정보 조회
    	    DepositTransactionDTO account = depositTransactionDAO.getSavingsAccountDetailByAccountNumber(dto.getAccountNumber());


        if (account == null) {
            throw new RuntimeException("계좌 정보를 찾을 수 없습니다.");
        }
        
        // 2. 비밀번호 입력 및 검증
        if (dto.getAccountPassword() == null || dto.getAccountPassword().isBlank()) {
            throw new RuntimeException("비밀번호가 입력되지 않았습니다.");
        }

        if (account.getAccountPassword() == null || account.getAccountPassword().isBlank()) {
            throw new RuntimeException("계좌에 저장된 비밀번호 정보가 없습니다.");
        }

        if (!passwordEncoder.matches(dto.getAccountPassword(), account.getAccountPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }


        // 3. 계좌 해지 처리
        int result = depositTransactionDAO.closeSavingsAccount(dto.getAccountNumber());
        if (result != 1) {
            throw new RuntimeException("계좌 해지 실패. 이미 해지되었거나 오류 발생.");
        }
        // 4. 기본 계좌 조회
        String basicAccountNumber = depositTransactionDAO.findBasicAccountNumberByCustomer(dto.getCustomerId());
        if (basicAccountNumber == null) {
            throw new RuntimeException("기본 계좌가 존재하지 않습니다.");
        }

        // 5. 기본 계좌에 잔액 입금
        BigDecimal amount = account.getBalance();
        depositTransactionDAO.depositToBasicAccount(basicAccountNumber, amount);

        // 6. 거래내역 기록 (기본 계좌에만)
        DepositTransactionDTO tx = new DepositTransactionDTO();
        tx.setAccountNumber(basicAccountNumber);
        tx.setTransactionType("입금");
        tx.setAmount(amount); 
        tx.setTransactionDescription("적금 해지로 인한 입금");
        tx.setCustomerId(dto.getCustomerId());
        tx.setCustomerName(dto.getCustomerId());
        tx.setAccountType("BASIC");              

        depositTransactionDAO.insertBasicTransaction(tx);
    }
    }
    
    
    

    
    