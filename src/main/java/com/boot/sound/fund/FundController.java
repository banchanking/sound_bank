package com.boot.sound.fund;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class FundController {

    @Autowired
    private FundServiceImpl service;
    
    private static final Logger logger = LoggerFactory.getLogger(FundController.class);

    // 펀드상품 목록 => http://localhost:8081/api/fundList  
    @GetMapping("/fundList")
    public ResponseEntity<List<FundDTO>> findAll() {
    	
    	logger.info("<<< contoller - fundList >>>");
        return new ResponseEntity<>(service.fundList(), HttpStatus.OK);		// 200
    }
    
    // 펀드상품 등록 PostMapping => http://localhost:8081/api/fundSave
    @PostMapping("/fundSave")
    public ResponseEntity<?> save(@RequestBody FundDTO funds) {
    	logger.info("<<< contoller - save >>>");
    	
    	return new ResponseEntity<>(service.saveFund(funds), HttpStatus.CREATED);	// 201 상태값 리턴
    }
    
    // 관리자가 등록한 펀드 저장 PostMapping => http://localhost:8081/api/saveRegisteredFunds
    @PostMapping("/saveRegisteredFunds")
    public ResponseEntity<String> saveRegisteredFunds(@RequestBody List<FundDTO> funds) {
        service.saveRegisteredFunds(funds);
        return ResponseEntity.ok("Registered funds saved successfully");
    }

    // 등록된 펀드 상품 목록 조회 GetMapping => http://localhost:8081/api/registeredFunds
    @GetMapping("/registeredFunds")
    public ResponseEntity<List<FundDTO>> getRegisteredFunds() {
        List<FundDTO> funds = service.getRegisteredFunds();
        return ResponseEntity.ok(funds);
    }
    
    // 펀드상품 상세보기 => http://localhost:8081/api/fundDetail/{fund_id} (펀드상품번호)
    @GetMapping("/fundDetail/{fund_id}")
    public ResponseEntity<FundDTO> findById(@PathVariable Long fund_id) {
    	logger.info("<<< contoller - findById >>>");
    	
    	return new ResponseEntity<FundDTO>(service.fundDetail(fund_id), HttpStatus.OK);	// 200
    }
    
 	// 펀드상품 수정 @PutMapping => http://localhost:8081/api/fundUpdate/{fund_id} (펀드상품번호)
    @PutMapping("/fundUpdate/{fund_id}")
    public ResponseEntity<Integer> updateFund(@PathVariable Long fund_id, @RequestBody FundDTO funds) {
    	logger.info("<<< contoller - updateFund >>>");
    	
    	return new ResponseEntity<>(service.updateFund(fund_id, funds), HttpStatus.CREATED);	// 201
    }
    
 	// 펀드상품 삭제 DeleteMapping => http://localhost:8081/api/fund/{fund_id} (펀드상품번호)
    @DeleteMapping("/fund/{fund_id}")
    public ResponseEntity<String> deleteFund(@PathVariable Long fund_id) {
        logger.info("<<< controller - deleteFund >>>");

        service.deleteFund(fund_id);
        return ResponseEntity.ok("펀드 삭제 성공");
    }
    
    // 투자성향 분석 AI 학습 완료된 펀드상품 목록 업데이트
    @PostMapping("/updateRiskTypes")
    public ResponseEntity<String> updateRiskTypes(@RequestBody List<FundDTO> funds) {
        service.updateRiskTypes(funds);
        return ResponseEntity.ok("펀드 상품에 투자성향 업데이트 성공");
    }
    
    // 투자 성향 테스트 등록 및 고객 정보 업데이트
    @PostMapping("test-result/save")
    public ResponseEntity<?> saveFundTestResult(@RequestBody FundTestDTO test) {
        logger.info("<<< controller - saveFundTestResult >>>");

        // 1. 투자 성향 테스트 결과 저장
        service.saveAndUpdateTest(test);

        // 2. 응답 반환
        return ResponseEntity.ok("투자 성향 결과가 저장되고 고객 정보가 업데이트되었습니다.");
    }

    @GetMapping("/fundRecommend/{customer_id}")
    public ResponseEntity<List<FundDTO>> recommendFunds(@PathVariable String customer_id) {
        logger.info("<<< controller - recommendFunds >>>");
    
        // 1. 고객의 투자 성향 가져오기
        String riskType = service.getCustomerRiskType(customer_id);
        logger.info("Customer Risk Type: {}", riskType);

        // 2. 투자 성향에 맞는 펀드 목록 가져오기
        List<FundDTO> recommendedFunds = service.getFundsByRiskType(riskType);
        logger.info("Recommended Funds: {}", recommendedFunds);
        
        return ResponseEntity.ok(recommendedFunds);
    }
}
    
