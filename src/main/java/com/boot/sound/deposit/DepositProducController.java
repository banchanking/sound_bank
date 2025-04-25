package com.boot.sound.deposit;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class DepositProducController {

	@Autowired
	private DepositProducService service;
	
//	// 예금 리스트   
//	@GetMapping("/deposit/list")
//	public ResponseEntity<?> getDepositsByCustomerId(@RequestParam String customerId) {
//		try {
//			List<DepositDTO> deposits = service.getDepositsByCustomerId(customerId);
//			return ResponseEntity.ok(deposits);
//		} catch (Exception e) {
//			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("데이터를 가져오는 중 오류가 발생했습니다.");
//		}
//	}
}
