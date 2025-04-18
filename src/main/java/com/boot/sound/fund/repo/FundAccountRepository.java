package com.boot.sound.fund.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.boot.sound.fund.dto.FundAccountDTO;

@Repository
public interface FundAccountRepository extends JpaRepository<FundAccountDTO, Integer> {
	
    List<FundAccountDTO> findByCustomerId(String customerId);
}
