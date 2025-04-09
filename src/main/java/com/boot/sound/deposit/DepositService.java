package com.boot.sound.deposit;

import java.util.List;

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
	
	// 예금 거래내역 리스트
	
	
	
	
	
}
