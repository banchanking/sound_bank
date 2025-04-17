package com.boot.sound.inquire.transfer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Repository
public interface TransActionRepository extends JpaRepository<TransActionDTO, Integer> {

    // 1. 특정 계좌번호의 모든 거래내역을 조회
    @Query("SELECT t FROM TransActionDTO t WHERE t.account_number = :account_number")
    List<TransActionDTO> findByAccountNumber(@Param("account_number") String account_number);

    // 2. 계좌번호 + 날짜 범위로 거래내역 조회 (예: 2025-01-01 ~ 2025-03-30 사이)
    @Query("SELECT t FROM TransActionDTO t WHERE t.account_number = :account_number AND t.transaction_date BETWEEN :start_date AND :end_date")
    List<TransActionDTO> findByAccountAndDate(
        @Param("account_number") String account_number,
        @Param("start_date") Date start_date,
        @Param("end_date") Date end_date
    );

    // 3. 계좌번호 + 날짜 범위 + 거래유형으로 조회 (예: 출금만 보기)
    @Query("SELECT t FROM TransActionDTO t WHERE t.account_number = :account_number AND t.transaction_date BETWEEN :start_date AND :end_date AND t.transaction_type = :transaction_type")
    List<TransActionDTO> findByAccountDateAndType(
        @Param("account_number") String account_number,
        @Param("start_date") Date start_date,
        @Param("end_date") Date end_date,
        @Param("transaction_type") String transaction_type
    );
    
    // 하루 이체 총합 계산 (계좌 여러 개 대상)
    @Query("SELECT COALESCE(SUM(t.amount), 0) " +
            "FROM TransActionDTO t " +
            "WHERE t.account_number IN :accountList " +
            "AND FUNCTION('DATE', t.transaction_date) = CURRENT_DATE")
     BigDecimal getTotalTransferredToday(@Param("accountList") List<String> accountList);
 }

