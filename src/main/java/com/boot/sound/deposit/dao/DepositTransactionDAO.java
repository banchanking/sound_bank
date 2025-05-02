package com.boot.sound.deposit.dao;

import java.math.BigDecimal;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.sound.deposit.dto.DepositDTO;
import com.boot.sound.deposit.dto.DepositTransactionDTO;

@Mapper
public interface DepositTransactionDAO {
    
    // 예금 거래 내역 조회
    List<DepositTransactionDTO> getDepositTransactions(@Param("accountNumber") String accountNumber, 
                                                     @Param("startDate") String startDate, 
                                                     @Param("endDate") String endDate);
    
    // 적금 거래 내역 조회
    List<DepositTransactionDTO> getSavingsTransactions(@Param("accountNumber") String accountNumber, 
                                                     @Param("startDate") String startDate, 
                                                     @Param("endDate") String endDate);
    
    // 예금 거래 내역 상세 조회
    DepositTransactionDTO getDepositTransactionDetail(int transactionId);
    
    // 적금 거래 내역 상세 조회
    DepositTransactionDTO getSavingsTransactionDetail(int transactionId);

    // 예금 거래 내역 생성
    int createDepositTransaction(DepositTransactionDTO dto);

    // 적금 거래 내역 생성
    int createSavingsTransaction(DepositTransactionDTO dto);

    // 예금 계좌 잔액 업데이트
    int updateDepositAccountBalance(@Param("accountNumber") String accountNumber, 
                                  @Param("balance") BigDecimal balance);

    // 적금 계좌 잔액 업데이트
    int updateSavingsAccountBalance(@Param("accountNumber") String accountNumber, 
                                  @Param("balance") BigDecimal balance);


    int closeDepositAccount(@Param("accountNumber") String accountNumber);
    int closeSavingsAccount(@Param("accountNumber") String accountNumber);
    int depositToBasicAccount(@Param("accountNumber") String basicAccountNumber, @Param("amount") BigDecimal amount);
    String findBasicAccountNumberByCustomer(String customerId);
    int insertBasicTransaction(DepositTransactionDTO dto);

	BigDecimal getSavingsAccountBalance(String accountNumber);
	BigDecimal getDepositAccountBalance(String accountNumber);

	void insertAccountTransaction(DepositTransactionDTO tx);
	

	DepositTransactionDTO getDepositAccountDetailByAccountNumber(@Param("accountNumber") String accountNumber);

	


} 