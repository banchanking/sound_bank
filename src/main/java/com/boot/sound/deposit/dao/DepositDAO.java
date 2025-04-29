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
    int createDepositAccount(DepositDTO dto);
    int createSavingsAccount(DepositDTO dto);

 // 예금 계좌 비밀번호 조회
    String getDepositAccountPassword(@Param("accountId") int accountId);
    

    // 적금 계좌 비밀번호 조회
    String getSavingsAccountPassword(@Param("accountId") int accountId);

 // 예금 계좌 입금
    int deposit(@Param("accountId") int accountId, @Param("amount") BigDecimal amount);

    // 예금 계좌 출금
    int withdraw(@Param("accountId") int accountId, @Param("amount") BigDecimal amount);

    // 적금 계좌 입금
    int depositSavings(@Param("accountId") int accountId, @Param("amount") BigDecimal amount);

    // 적금 계좌 출금
    int withdrawSavings(@Param("accountId") int accountId, @Param("amount") BigDecimal amount);



    // 거래 내역
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
    int changeDepositAccountPassword(@Param("accountId") int accountId, @Param("oldPassword") String oldPassword, @Param("newPassword") String newPassword);
    int changeSavingsAccountPassword(@Param("accountId") int accountId, @Param("oldPassword") String oldPassword, @Param("newPassword") String newPassword);
    
    // 예금 상품 추가
    int addDepositProduct(DepositDTO dto);
    
    // 적금 상품 추가
    int addSavingsProduct(DepositDTO dto);

    // 예금 상품 수정
    int updateDepositProduct(@Param("productId") int productId, @Param("dto") DepositDTO dto);

    // 예금 상품 삭제
    int deleteDepositProduct(@Param("productId") String productId);
    
    
    // 적금 상품 수정
    int updateSavingsProduct(@Param("productId") int productId, @Param("dto") DepositDTO dto);

    // 적금 상품 삭제
    int deleteSavingsProduct(@Param("productId") String productId);
    
    BigDecimal getDepositAccountBalanceByAccountNumber(@Param("accountNumber") String accountNumber);
    
    BigDecimal getSavingsAccountBalanceByAccountNumber(@Param("accountNumber") String accountNumber);
    
    
    BigDecimal getDepositAccountBalance(String accountNumber);   // 잔액 조회
    BigDecimal getSavingsAccountBalance(String accountNumber);   // 적금 잔액 조회

    // 예금해지
    int closeDepositAccount(@Param("accountNumber") String accountNumber, @Param("accountPassword") String accountPassword);
    // 적금해지
    int closeSavingsAccount(@Param("accountNumber") String accountNumber, @Param("accountPassword") String accountPassword);

    // customer_id 가져오기 (예금)
    String getCustomerIdFromDepositAccount(@Param("accountNumber") String accountNumber);

    // customer_id 가져오기 (적금)
    String getCustomerIdFromSavingsAccount(@Param("accountNumber") String accountNumber);

    // 기본 계좌로 잔액 이체
    int transferBalanceToMainAccount(@Param("accountNumber") String accountNumber, @Param("balance") BigDecimal balance);

    
    // 예금 계좌 잔액 이체
    int transferDepositBalanceToAccount(@Param("accountNumber") String accountNumber, @Param("balance") BigDecimal balance);

    // 적금 계좌 잔액 이체 (이것도 같이)
    int transferSavingsBalanceToAccount(@Param("accountNumber") String accountNumber, @Param("balance") BigDecimal balance);
    
    // 예금 별명 변경
    int updateNickname(@Param("accountId") String accountId, @Param("nickname") String nickname);
    
 // 적금 별명 업데이트
    int updateSavingsNickname(@Param("accountId") String accountId, @Param("nickname") String nickname);


 // 출금계좌 잔액 차감
    int withdrawFromAccount(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);


 // 출금계좌 잔액 차감
    int decreaseBalance(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);

    
    BigDecimal getDepositBalanceByAccountNumber(@Param("accountNumber") String accountNumber);
    BigDecimal getSavingsBalanceByAccountNumber(@Param("accountNumber") String accountNumber);

    String getMainAccountNumber(@Param("customerId") String customerId);

    
    int transferBalance(@Param("fromAccountNumber") String fromAccountNumber,
            @Param("toAccountNumber") String toAccountNumber,
            @Param("amount") BigDecimal amount);


 // 자동이체 리스트 조회
    List<DepositDTO> getAutoTransferList(@Param("today") int today);

    // 출금 처리
 // 자동이체 출금 (새 메서드)
    int autoWithdrawFromBasicAccount(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);

    // 입금 처리
    int depositToDepositAccount(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);

    

} 
