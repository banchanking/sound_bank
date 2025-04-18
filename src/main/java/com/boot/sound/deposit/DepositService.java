package com.boot.sound.deposit;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class DepositService {

      
	@Autowired
	private DepositDAO dao;

	// 예금 리스트
	@Transactional(readOnly=true)
	public List<DepositDTO> getDepositsByCustomerId(String customerId) {
	    return dao.findDepositsByCustomerId(customerId);
	}


	// 예금 계좌 등록
	@Transactional
	public String depositInsert(DepositDTO dto) {
	    System.out.println("서비스 - depositInsert");
	    String accountNum = generateRandomAccountNum();
	    dto.setDat_deposit_account_num(accountNum); 
	    dao.depositInsert(dto);
	    return accountNum; // 생성된 계좌번호 반환
	}

	// 계좌 랜덤 생성
	private String generateRandomAccountNum() {
	    Random random = new Random();
	    String part1 = "174";
	    String part2 = String.format("%06d", random.nextInt(1000000));
	    String part3 = String.format("%04d", random.nextInt(100000));
	    return part1 + "-" + part2 + "-" + part3;
	}

	// 예금 이체
	@Transactional
	public void processTransaction(DepositDTO dto) {
	    String accountNumber = dto.getDat_deposit_account_num();
	    BigDecimal amount = dto.getDat_new_amount();
	    String transactionType = dto.getDat_transaction_type(); // 거래 유형 (입금/출금)

	    // 현재 잔액 조회
	    BigDecimal currentBalance = dao.getBalanceByAccountNumber(accountNumber);
	    if (currentBalance == null) {
	        throw new IllegalArgumentException("계좌번호를 찾을 수 없습니다.");
	    }

	    // 입출금 처리
	    if ("입금".equals(transactionType)) {
	        currentBalance = currentBalance.add(amount);
	    } else if ("출금".equals(transactionType)) {
	        if (currentBalance.compareTo(amount) < 0) {
	            throw new IllegalArgumentException("잔액이 부족합니다.");
	        }
	        currentBalance = currentBalance.subtract(amount);
	    } else {
	        throw new IllegalArgumentException("유효하지 않은 거래 유형입니다.");
	    }

	    // 잔액 업데이트
	    dto.setDat_balance(currentBalance);
	    dao.updateBalance(dto);
	}
	
	
	
	
	
}
