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


	// 신규 예금계좌 추가
	public int depositInsert(DepositDTO dto);


	// 계좌번호로 잔액 조회
	BigDecimal getBalanceByAccountNumber(@Param("accountNumber") String accountNumber);

	// 잔액 업데이트
	void updateBalance(DepositDTO dto);
}
