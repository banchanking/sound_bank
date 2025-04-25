package com.boot.sound.deposit.dao;

import com.boot.sound.deposit.dto.SavingsAccountDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface SavingsAccountDAO {
    // 계좌 목록 조회
    List<SavingsAccountDTO> findAccountsByCustomerId(@Param("customerId") String customerId);
    
    // 계좌 상세 조회
    SavingsAccountDTO findAccountById(@Param("satId") int satId);
    
    // 계좌 생성
    int createAccount(SavingsAccountDTO account);
    
    // 계좌 수정
    int updateAccount(SavingsAccountDTO account);
    
    // 계좌 해지
    int deleteAccount(@Param("satId") int satId);
} 