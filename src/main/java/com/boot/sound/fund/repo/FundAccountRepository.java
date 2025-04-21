package com.boot.sound.fund.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boot.sound.fund.dto.FundAccountDTO;

@Repository
public interface FundAccountRepository extends JpaRepository<FundAccountDTO, Integer> {
	
	// 펀드 계좌 조회
    List<FundAccountDTO> findByCustomerId(String customerId);
    
    // 펀드 계좌 개설요청 조회
    List<FundAccountDTO> findByStatus(String status);
}
