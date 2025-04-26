package com.boot.sound.deposit.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.sound.deposit.dto.DepositDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Mapper
public interface DepositDAO {
    // 상품 관련
    List<DepositDTO> getDepositProducts();
    List<DepositDTO> getSavingsProducts();
    DepositDTO getDepositProductDetail(@Param("productId") int productId);
    DepositDTO getSavingsProductDetail(@Param("productId") int productId);

    // 계좌 관련
    List<DepositDTO> getDepositAccounts(@Param("customerId") String customerId);
    List<DepositDTO> getSavingsAccounts(@Param("customerId") String customerId);
    DepositDTO getDepositAccountDetail(@Param("accountId") int accountId);
    DepositDTO getSavingsAccountDetail(@Param("accountId") int accountId);

    // 계좌 생성/해지
    int createDepositAccount(@Param("account") DepositDTO account);
    int createSavingsAccount(@Param("account") DepositDTO account);
    int closeDepositAccount(@Param("accountId") int accountId, @Param("accountPassword") String accountPassword);
    int closeSavingsAccount(@Param("accountId") int accountId, @Param("accountPassword") String accountPassword);

    // 입출금
    int deposit(@Param("accountId") int accountId, @Param("transactionAmount") BigDecimal transactionAmount);
    int withdraw(@Param("accountId") int accountId, @Param("transactionAmount") BigDecimal transactionAmount);
    int depositSavings(@Param("accountId") int accountId, @Param("transactionAmount") BigDecimal transactionAmount);
    int withdrawSavings(@Param("accountId") int accountId, @Param("transactionAmount") BigDecimal transactionAmount);

    // 거래 내역
    int createDepositTransaction(@Param("transaction") DepositDTO transaction);
    int createSavingsTransaction(@Param("transaction") DepositDTO transaction);
    List<DepositDTO> getDepositTransactions(@Param("accountId") int accountId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    List<DepositDTO> getSavingsTransactions(@Param("accountId") int accountId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 자동이체
    int setAutoTransfer(@Param("accountId") int accountId, @Param("enabled") boolean enabled, @Param("amount") BigDecimal amount, @Param("transferDay") int transferDay);
    List<DepositDTO> getAutoTransferAccounts(@Param("today") int today);
    int executeAutoTransfer(@Param("accountId") int accountId, @Param("transactionAmount") BigDecimal transactionAmount);

    // 만기/이자
    List<DepositDTO> getMaturedSavingsAccounts(@Param("today") LocalDate today);
    int processMaturity(@Param("accountId") int accountId, @Param("interestAmount") BigDecimal interestAmount);
    int updateSavingsAccountStatus(@Param("accountId") int accountId, @Param("status") String status);
    List<DepositDTO> getInterestPaymentDepositAccounts(@Param("today") LocalDate today);
    List<DepositDTO> getInterestPaymentSavingsAccounts(@Param("today") LocalDate today);
    int payDepositInterest(@Param("accountId") int accountId, @Param("interestAmount") BigDecimal interestAmount);
    int paySavingsInterest(@Param("accountId") int accountId, @Param("interestAmount") BigDecimal interestAmount);

    // 기타
    int checkAccountNumber(@Param("accountNumber") String accountNumber);
    BigDecimal getDepositAccountBalance(@Param("accountId") int accountId);
    BigDecimal getSavingsAccountBalance(@Param("accountId") int accountId);
    int changeDepositAccountPassword(@Param("accountId") int accountId, @Param("oldPassword") String oldPassword, @Param("newPassword") String newPassword);
    int changeSavingsAccountPassword(@Param("accountId") int accountId, @Param("oldPassword") String oldPassword, @Param("newPassword") String newPassword);
    
    // 예금 상품 추가
    int addDepositProduct(DepositDTO product);
    
    // 적금 상품 추가
    int addSavingsProduct(DepositDTO product);

    // 예금 상품 수정
    int updateDepositProduct(@Param("productId") int productId, @Param("product") DepositDTO product);
    
    // 예금 상품 삭제 
    int deleteDepositProduct(@Param("productId") int productId);
} 