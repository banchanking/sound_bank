package com.boot.sound.exchange.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.sound.exchange.dto.ExchangeWalletDTO;
import com.boot.sound.exchange.service.AdminExchangeService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin // Origin 에러 방지
@Slf4j
public class ExchangeAdminController {
	
	@Autowired
	private AdminExchangeService service;	
	
	// 수수료 일괄 수정
    @PutMapping("/updateRatesFee")
    public ResponseEntity<?> updateFeeRates(@RequestBody List<Map<String, Object>> feeRateList) {
        
    	System.out.println("controller - update exchange fee");
    	
    	int updatedCount = service.updateFeeRates(feeRateList);
        
    	return ResponseEntity.ok("Updated rows: " + updatedCount);
    }
	
	// 회원지갑 목록조회
    @GetMapping("/wallets")
    public ResponseEntity<List<Map<String, Object>>> getAllWallets() {

		System.out.println("controller - getAllWallets");

        return ResponseEntity.ok(service.findAllWallets());
    }

    // 고객 ID 목록
    @GetMapping("/wallets/customers")
    public ResponseEntity<List<Map<String, Object>>> getAllCustomerIds() {

		System.out.println("controller - getAllCustomerIds");

        return ResponseEntity.ok(service.findAllCustomerIds());
    }

    // 특정 고객의 지갑 목록
    @GetMapping("/wallets/{customer_id}")
    public ResponseEntity<List<Map<String, Object>>> getWalletsByCustomerId(@PathVariable String customer_id) {

		System.out.println("controller - getWalletsByCustomerId");
		List <Map<String,Object>> walletList = service.findWalletsByCustomerId(customer_id);     
		System.out.println(customer_id + "의 지갑목록 :" + walletList);
		
		return ResponseEntity.ok(walletList);
    }
	// 지갑 상태 단건 또는 일괄 수정
    @PutMapping("/wallets/update")
    public ResponseEntity<?> updateWalletStatus(@RequestBody Object body) {
        System.out.println("controller - updateWalletStatus");

        if (body instanceof List) {
            List<Map<String, Object>> wallets = (List<Map<String, Object>>) body;
            int updated = 0;
            for (Map<String, Object> wallet : wallets) {
                updated += service.updateWalletStatus(wallet);
            }
            return ResponseEntity.ok("Updated: " + updated);
        } else if (body instanceof Map) {
            int result = service.updateWalletStatus((Map<String, Object>) body);
            return ResponseEntity.ok("Updated: " + result);
        } else {
            return ResponseEntity.badRequest().body("Invalid payload");
        }
    }
}

