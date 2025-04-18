package com.boot.sound.inquire.account;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface AccountDAO {

    // 고객 ID로 입출금 계좌 목록 조회
	public List<AccountDTO> findAllByCustomerId(String customer_id);    
	
    public void insertAccount(AccountDTO account);
    
}