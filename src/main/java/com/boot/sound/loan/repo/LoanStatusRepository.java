package com.boot.sound.loan.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.boot.sound.loan.dto.LoanStatusDTO;

import java.util.List;

import javax.transaction.Transactional;

public interface LoanStatusRepository extends JpaRepository<LoanStatusDTO, Integer> {
    
    // 상환일(repayment_date)이 오늘 날짜와 같은 대출 건들 조회
    List<LoanStatusDTO> findByRepaymentDate(String repayment_date);
    
    @Modifying
    @Transactional
    @Query("UPDATE LoanStatusDTO l SET l.loanProgress = :loanProgress WHERE l.loanStatusNo = :loanStatusNo")
    int updateLoanStatus(@Param("loanStatusNo") int loanStatusNo,
                         @Param("loanProgress") String loanProgress);
}

