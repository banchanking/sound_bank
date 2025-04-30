package com.boot.sound.deposit.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.boot.sound.deposit.dto.DepositAutoTransferDTO;

import java.math.BigDecimal;
import java.util.List;

/**
 * DepositAutoTransferDAO
 * 자동이체 관련 DB 작업 인터페이스
 */
@Mapper
public interface DepositAutoTransferDAO {

    // 오늘 이체해야 할 자동이체 리스트 조회
    List<DepositAutoTransferDTO> getTodayAutoTransfers(@Param("today") int today);

    // 기본 입출금 계좌에서 출금
    int withdrawFromBasicAccount(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);

    // 예금 계좌로 입금
    int depositToDepositAccount(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);

    // 적금 계좌로 입금
    int depositToSavingsAccount(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);

    // 자동이체 등록
    void createAutoTransfer(DepositAutoTransferDTO transferDTO);

    // 고객의 자동이체 리스트 조회
    List<DepositAutoTransferDTO> getCustomerAutoTransfers(@Param("withdrawAccountNumber") String withdrawAccountNumber);

    // 자동이체 삭제
    void deleteAutoTransfer(@Param("id") Long id);
    
    // 자동이체 수정
    void updateAutoTransfer(DepositAutoTransferDTO transferDTO);

    
 

}