package com.boot.sound.deposit.dao;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.sound.deposit.dto.DepositDTO;

@Mapper
public interface DepositDAO {


    // 예금 상품 목록 조회 
    List<DepositDTO> getDepositProducts();

    
    // 예금 상품 상세 조회     
    DepositDTO getDepositProductDetail(int productId);

    
    // 예금 상품 추가
    int addDepositProduct(DepositDTO product);

    
    // 예금 상품 수정     
    //int updateDepositProduct(int productId, DepositDTO product);
    int updateDepositProduct(@Param("productId") int productId, @Param("product") DepositDTO product);
    

    // 예금 상품 삭제 
    int deleteDepositProduct(String productId);

    // 적금 상품 목록 조회

    List<DepositDTO> getSavingsProducts();
    
    // 적금 상품 상세 조회
    DepositDTO getSavingsProductDetail(int productId);
    
    // 적금 상품 추가    
    int addSavingsProduct(DepositDTO product);

    
    // 적금 상품 수정     
    //int updateSavingsProduct(int productId, DepositDTO product);
    int updateSavingsProduct(@Param("productId") int productId, @Param("product") DepositDTO product);
    // 적금 상품 삭제
    int deleteSavingsProduct(String productId);
    
    // 계좌번호 중복 확인
    int checkAccountNumber(String accountNumber);

    // 예금 거래내역 등록
    int createDepositTransaction(DepositDTO dto);

    // 적금 거래내역 등록
    int createSavingsTransaction(DepositDTO dto);
    
    // 예금 잔액 체크
    int updateDepositBalance(@Param("accountNumber") String accountNumber, @Param("newBalance") BigDecimal newBalance);

    int updateSavingsBalance(@Param("accountNumber") String accountNumber, @Param("newBalance") BigDecimal newBalance);
    
    // 예금 거래내역 조회
    List<DepositDTO> getDepositTransactions(@Param("accountId") int accountId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 적금 거래내역 조회
    List<DepositDTO> getSavingsTransactions(@Param("accountId") int accountId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
    

    // 예금 계좌 생성
    int createDepositAccount(DepositDTO dto);

    // 적금 계좌 생성
    int createSavingsAccount(DepositDTO dto);

    // 예금 계좌 해지
    int closeDepositAccount(@Param("accountNumber") String accountNumber, @Param("accountPassword") String accountPassword);

    // 적금 계좌 해지
    int closeSavingsAccount(@Param("accountNumber") String accountNumber, @Param("accountPassword") String accountPassword);
    
    int changeDepositAccountPassword(@Param("accountId") int accountId, @Param("oldPassword") String oldPassword, @Param("newPassword") String newPassword);
    int changeSavingsAccountPassword(@Param("accountId") int accountId, @Param("oldPassword") String oldPassword, @Param("newPassword") String newPassword);

    // 계좌 별명 변경
    int updateDepositAccountNickname(@Param("accountId") String accountId, @Param("nickname") String nickname);
    int updateSavingsAccountNickname(@Param("accountId") String accountId, @Param("nickname") String nickname);

    // 계좌 상세 조회 (ID 기준)
    DepositDTO getDepositAccountDetail(@Param("accountId") int accountId);

    // 계좌 상세 조회 (계좌 번호 기준)
    DepositDTO getDepositAccountDetailByAccountNumber(@Param("accountNumber") String accountNumber);
    
    // 적금 계좌 상세 조회
    DepositDTO getSavingsAccountDetail(@Param("accountId") int accountId);
    
    // 잔액 조회
    BigDecimal getDepositAccountBalanceByAccountNumber(@Param("accountNumber") String accountNumber);
    BigDecimal getSavingsAccountBalanceByAccountNumber(@Param("accountNumber") String accountNumber);
    
    /** 고객의 예금 계좌 목록 조회 */
    List<DepositDTO> getDepositAccounts(@Param("customerId") String customerId);

    /** 고객의 적금 계좌 목록 조회 */
    List<DepositDTO> getSavingsAccounts(@Param("customerId") String customerId);
    
    
    // 출금계좌 잔액 증가
    int depositToBasicAccount (@Param("accountNumber") String accountNumber,
    		@Param("amount") BigDecimal amount,  @Param("customerId") String customerId);
    
    // 출금계좌 잔액 차감
    int withdrawFromBasicAccount(@Param("accountNumber") String accountNumber,
            @Param("amount") BigDecimal amount,  @Param("customerId") String customerId);

    // 기본 계좌 조회
    String getBasicAccountNumber(@Param("customerId") String customerId);

    
    // 기본계좌 잔액조회
    BigDecimal getBasicAccountBalanceByAccountNumber(@Param("accountNumber") String accountNumber);






    




}