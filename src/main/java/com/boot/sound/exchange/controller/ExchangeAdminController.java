package com.boot.sound.exchange.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.sound.exchange.service.AdminExchangeService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin // Origin 에러 방지
@Slf4j
public class ExchangeAdminController {
	
	@Autowired
	private AdminExchangeService service;	
	
	// 환율rate에서 수수료/환율 조정
	// 수수료 일괄 수정
    @PutMapping("updateRatesFee")
    public ResponseEntity<?> updateFeeRates(@RequestBody List<Map<String, Object>> feeRateList) {
        
    	System.out.println("controller - update exchange fee");
    	int updatedCount = service.updateFeeRates(feeRateList);
        return ResponseEntity.ok("Updated rows: " + updatedCount);
    }
	
	// 회원지갑 목록조회
	
	// 회원 지갑업데이트 (active/deactive)
	
	// API 환율수동 저장하기
	
	// 환전요청 승인/거부
}
