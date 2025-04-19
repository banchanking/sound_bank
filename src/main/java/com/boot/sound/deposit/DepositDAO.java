package com.boot.sound.deposit;

import java.math.BigDecimal;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface DepositDAO {

	// 예금 리스트
	List<DepositDTO> findDepositsByCustomerId(@Param("customerId") String customerId);

	// 예금 계좌 등록
	int depositInsert(DepositDTO dto);

	// 잔액 조회
	BigDecimal getBalanceByAccountNumber(@Param("accountNumber") String accountNumber);

	// 잔액 업데이트
	void updateBalance(DepositDTO dto);

	// 적금 리스트 조회
	List<SavingsDTO> findSavingsByCustomerId(@Param("customerId") String customerId);

	// 적금 계좌 등록
	int savingsInsert(SavingsDTO dto);
}
