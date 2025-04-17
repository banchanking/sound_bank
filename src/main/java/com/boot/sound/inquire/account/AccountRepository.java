package com.boot.sound.inquire.account;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import javax.transaction.Transactional;

@Repository
public interface AccountRepository extends CrudRepository<AccountDTO, String> {

	// 고객 소유한 전체 계좌 조회 (DTO 전체 반환)
    @Query("SELECT a FROM AccountDTO a WHERE a.customer_id = :customer_id")
    List<AccountDTO> findAccountsByCustomerId(@Param("customer_id") String customer_id);

    // 고객 소유한 계좌번호만 추출 (한도/거래 집계용)
    @Query("SELECT a.accountNumber FROM AccountDTO a WHERE a.customer_id = :customer_id")
    List<String> findAccountNumbersByCustomerId(@Param("customer_id") String customer_id);

	
	// 이체부분-> 

	// 출금 - 잔액 감소 (잔액이 충분할 때만)
    @Modifying // @Query는 select만 적용,  cud는 @Modifying 추가 
    @Transactional // 계좌이체 실패시 자동 롤백 
    @Query("UPDATE AccountDTO a SET a.balance = a.balance - :money WHERE a.accountNumber = :acc AND a.balance >= :money")
    // AND a.balance >= :money	잔액이 충분한 경우에만 차감됨
    int minusBalance(@Param("acc") String acc, @Param("money") BigDecimal money);

    // 입금 - 잔액 증가
    @Modifying
    @Transactional
    @Query("UPDATE AccountDTO a SET a.balance = a.balance + :money WHERE a.accountNumber = :acc")
    int plusBalance(@Param("acc") String acc, @Param("money") BigDecimal money);

    // 계좌번호 조회
    Optional<AccountDTO> findByAccountNumber(String account_number);
    
}