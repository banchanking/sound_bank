package com.boot.sound.deposit.dao;

import com.boot.sound.deposit.dto.DepositAccountDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface DepositAccountDAO {
    // 계좌 목록 조회
    List<DepositAccountDTO> findAccountsByCustomerId(@Param("customerId") String customerId);
    
    // 계좌 상세 조회
    DepositAccountDTO findAccountById(@Param("datId") int datId);
    
    // 계좌 생성
    int createAccount(DepositAccountDTO account);
    
    // 계좌 수정
    int updateAccount(DepositAccountDTO account);
    
    // 계좌 해지
    int deleteAccount(@Param("datId") int datId);
    
    // 자동이체 설정 변경
    int updateAutoTransfer(@Param("datId") int datId, @Param("autoTransfer") boolean autoTransfer);
} 