package com.boot.sound.deposit.dao;

import com.boot.sound.deposit.dto.DepositTransactionDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Mapper
@Repository
public interface DepositTransactionDAO {
    // 거래내역 조회
    List<DepositTransactionDTO> findTransactionsByAccount(
        @Param("datId") int datId,
        @Param("startDate") Date startDate,
        @Param("endDate") Date endDate
    );
    
    // 거래내역 생성
    int createTransaction(DepositTransactionDTO transaction);
    
    // 계좌 잔액 업데이트
    int updateAccountBalance(
        @Param("datId") int datId,
        @Param("balance") BigDecimal balance
    );
} 