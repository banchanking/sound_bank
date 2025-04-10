package com.boot.sound.deposit;

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
	public List<DepositDTO> depositList() {
		System.out.println("서비스 - depositList");
		return dao.depositList();
	}
	

    // 예금 계좌 등록
	@Transactional
	public int depositInsert(DepositDTO dto) {
		String accountNum = generateRandomAccountNum();
		dto.setDat_account_Num(accountNum); 
		return dao.depositInsert(dto);
	}
	
	
	
	// 계좌 랜덤 생성
    private String generateRandomAccountNum() {
		Random random = new Random();
		String part1 = "174";
		String part2 = String.format("%06d", random.nextInt(1000000));
		String part3 = String.format("%04d", random.nextInt(100000));
		return part1 + "-" + part2 + "-" + part3;
	}
	
	
	
	
	
}
