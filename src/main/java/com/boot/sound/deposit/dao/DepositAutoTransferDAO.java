package com.boot.sound.deposit.dao;

import com.boot.sound.deposit.dto.DepositAutoTransferDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Mapper
@Repository
public interface DepositAutoTransferDAO {
    // 자동이체 목록 조회
    List<DepositAutoTransferDTO> findAutoTransfersByAccount(@Param("datId") int datId);
    
    // 자동이체 상세 조회
    DepositAutoTransferDTO findAutoTransferById(@Param("autoTransferId") int autoTransferId);
    
    // 자동이체 생성
    int createAutoTransfer(DepositAutoTransferDTO autoTransfer);
    
    // 자동이체 수정
    int updateAutoTransfer(DepositAutoTransferDTO autoTransfer);
    
    // 자동이체 삭제
    int deleteAutoTransfer(@Param("autoTransferId") int autoTransferId);
    
    // 자동이체 상태 변경
    int updateAutoTransferStatus(
        @Param("autoTransferId") int autoTransferId,
        @Param("status") String status
    );

    // 특정 날짜에 실행할 자동이체 목록 조회
    List<DepositAutoTransferDTO> findByExecutionDate(@Param("executionDate") LocalDate executionDate);
    
    // 매월 특정 일자에 실행할 자동이체 목록 조회
    List<DepositAutoTransferDTO> findByMonthlyExecutionDate(@Param("dayOfMonth") int dayOfMonth);
    
    // 특정 상태의 자동이체 목록 조회
    List<DepositAutoTransferDTO> findByStatus(@Param("status") String status);
} 