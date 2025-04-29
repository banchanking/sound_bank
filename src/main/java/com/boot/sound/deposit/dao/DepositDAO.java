package com.boot.sound.deposit.dao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.sound.deposit.dto.DepositDTO;

@Mapper
public interface DepositDAO {

    // ===== 상품 관련 =====
    List<DepositDTO> getDepositProducts();
    List<DepositDTO> getSavingsProducts();
    DepositDTO getDepositProductDetail(@Param("productId") int productId);
    DepositDTO getSavingsProductDetail(@Param("productId") int productId);

    // ===== 계좌 관련 =====
    List<DepositDTO> getDepositAccounts(@Param("customerId") String customerId);
    List<DepositDTO> getSavingsAccounts(@Param("customerId") String customerId);
    DepositDTO getDepositAccountDetail(@Param("accountId") int accountId);
    DepositDTO getSavingsAccountDetail(@Param("accountId") int accountId);

    int createDepositAccount(DepositDTO dto);
    int createSavingsAccount(DepositDTO dto);

    String getDepositAccountPassword(@Param("accountId") int accountId);
    String getSavingsAccountPassword(@Param("accountId") int accountId);

    int deposit(@Param("accountId") int accountId, @Param("amount") BigDecimal amount);
    int withdraw(@Param("accountId") int accountId, @Param("amount") BigDecimal amount);
    int depositSavings(@Param("accountId") int accountId, @Param("amount") BigDecimal amount);
    int withdrawSavings(@Param("accountId") int accountId, @Param("amount") BigDecimal amount);

    int closeDepositAccount(@Param("accountNumber") String accountNumber, @Param("accountPassword") String accountPassword);
    int closeSavingsAccount(@Param("accountNumber") String accountNumber, @Param("accountPassword") String accountPassword);

    // ===== 거래 관련 =====
    int createDepositTransaction(@Param("transaction") DepositDTO transaction);
    int createSavingsTransaction(@Param("transaction") DepositDTO transaction);

    List<DepositDTO> getDepositTransactions(
        @Param("accountId") int accountId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    List<DepositDTO> getSavingsTransactions(
        @Param("accountId") int accountId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // ===== 자동이체 관련 =====
    int setAutoTransfer(@Param("accountId") int accountId, @Param("enabled") boolean enabled,
                        @Param("amount") BigDecimal amount, @Param("transferDay") int transferDay);
    List<DepositDTO> getAutoTransferAccounts(@Param("today") int today);
    int executeAutoTransfer(@Param("accountId") int accountId, @Param("transactionAmount") BigDecimal transactionAmount);

    // ===== 만기 및 이자 관련 =====
    List<DepositDTO> getMaturedSavingsAccounts(@Param("today") LocalDate today);
    int processMaturity(@Param("accountId") int accountId, @Param("interestAmount") BigDecimal interestAmount);
    int updateSavingsAccountStatus(@Param("accountId") int accountId, @Param("status") String status);

    List<DepositDTO> getInterestPaymentDepositAccounts(@Param("today") LocalDate today);
    List<DepositDTO> getInterestPaymentSavingsAccounts(@Param("today") LocalDate today);

    int payDepositInterest(@Param("accountId") int accountId, @Param("interestAmount") BigDecimal interestAmount);
    int paySavingsInterest(@Param("accountId") int accountId, @Param("interestAmount") BigDecimal interestAmount);

    // ===== 기타 기능 =====
    int checkAccountNumber(@Param("accountNumber") String accountNumber);

    int changeDepositAccountPassword(@Param("accountId") int accountId,
                                      @Param("oldPassword") String oldPassword,
                                      @Param("newPassword") String newPassword);

    int changeSavingsAccountPassword(@Param("accountId") int accountId,
                                      @Param("oldPassword") String oldPassword,
                                      @Param("newPassword") String newPassword);

    int addDepositProduct(DepositDTO dto);
    int addSavingsProduct(DepositDTO dto);

    int updateDepositProduct(@Param("productId") int productId, @Param("dto") DepositDTO dto);
    int deleteDepositProduct(@Param("productId") String productId);

    int updateSavingsProduct(@Param("productId") int productId, @Param("dto") DepositDTO dto);
    int deleteSavingsProduct(@Param("productId") String productId);

    BigDecimal getDepositAccountBalanceByAccountNumber(@Param("accountNumber") String accountNumber);
    BigDecimal getSavingsAccountBalanceByAccountNumber(@Param("accountNumber") String accountNumber);

    BigDecimal getDepositBalanceByAccountNumber(@Param("accountNumber") String accountNumber);
    BigDecimal getSavingsBalanceByAccountNumber(@Param("accountNumber") String accountNumber);

    String getCustomerIdFromDepositAccount(@Param("accountNumber") String accountNumber);
    String getCustomerIdFromSavingsAccount(@Param("accountNumber") String accountNumber);

    int transferBalanceToMainAccount(@Param("accountNumber") String accountNumber, @Param("balance") BigDecimal balance);

    int transferDepositBalanceToAccount(@Param("accountNumber") String accountNumber, @Param("balance") BigDecimal balance);
    int transferSavingsBalanceToAccount(@Param("accountNumber") String accountNumber, @Param("balance") BigDecimal balance);

    int updateNickname(@Param("accountId") String accountId, @Param("nickname") String nickname);
    int updateSavingsNickname(@Param("accountId") String accountId, @Param("nickname") String nickname);

    int withdrawFromAccount(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);
    int decreaseBalance(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);

    String getMainAccountNumber(@Param("customerId") String customerId);

    int transferBalance(@Param("fromAccountNumber") String fromAccountNumber,
                        @Param("toAccountNumber") String toAccountNumber,
                        @Param("amount") BigDecimal amount);

    List<DepositDTO> getAutoTransferList(@Param("today") int today);

    int autoWithdrawFromBasicAccount(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);
    int depositToDepositAccount(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);
    
    // accountId로 계좌번호 조회 후 잔액 반환
    BigDecimal getDepositAccountBalance(@Param("accountId") int accountId);
    BigDecimal getSavingsAccountBalance(@Param("accountId") int accountId);

}
