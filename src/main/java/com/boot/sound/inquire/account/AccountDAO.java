package com.boot.sound.inquire.account;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface AccountDAO {

    // 고객 ID로 계좌 목록 조회
	public List<AccountDTO> findAllByCustomerId(String customer_id); // 입출금
	public List<AccountDTO> findDepositAccounts(String customer_id); // 예금
	public List<AccountDTO> findSavingsAccounts(String customer_id); // 적금
	
    public void insertAccount(AccountDTO account);
    
    // 입출금 계좌 해지
    public void deleteAccount(String account_number);
    
    // 예적금 가입시 기본계좌에 등록
    public void insertDepositAccount(AccountDTO account);
    
    // 입출금 계좌 상태 변경 (해지)
    void updateAccountStatusToClosed(String accountNumber);

    
}