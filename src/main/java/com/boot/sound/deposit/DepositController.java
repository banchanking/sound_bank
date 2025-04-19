package com.boot.sound.deposit;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class DepositController {
	
	@Autowired
	private DepositService depositService;
	
	@Autowired
	private TransactionHistoryService transactionHistoryService;
	
	// 예금 리스트   
	@GetMapping("/deposit/list")
	public ResponseEntity<?> getDepositsByCustomerId(@RequestParam String customerId) {
		try {
			List<DepositDTO> deposits = depositService.getDepositsByCustomerId(customerId);
			return ResponseEntity.ok(deposits);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("데이터를 가져오는 중 오류가 발생했습니다.");
		}
	}
	
	// 예금 계좌 등록
	@PostMapping("/deposit/join")
	public ResponseEntity<?> depositInsert(@RequestBody DepositDTO dto) {
		System.out.println("컨트롤러 - depositInsert");
		String generatedAccountNum = depositService.depositInsert(dto);
		Map<String, String> response = Map.of(
			"message", "Deposit successfully inserted",
			"dat_deposit_account_num", generatedAccountNum
		);
		return ResponseEntity.ok(response);
	}
	
	// 잔액 조회
	@GetMapping("/deposit/balance")
	public ResponseEntity<BigDecimal> getBalance(@RequestParam String accountNumber) {
		BigDecimal balance = depositService.getBalanceByAccountNumber(accountNumber);
		return ResponseEntity.ok(balance);
	}
	
	// 잔액 업데이트
	@PostMapping("/deposit/balance")
	public ResponseEntity<Void> updateBalance(@RequestBody DepositDTO dto) {
		depositService.updateBalance(dto);
		return ResponseEntity.ok().build();
	}
	
	// 적금 리스트 조회
	@GetMapping("/savings/list")
	public ResponseEntity<?> getSavingsByCustomerId(@RequestParam String customerId) {
		try {
			List<SavingsDTO> savings = depositService.getSavingsByCustomerId(customerId);
			return ResponseEntity.ok(savings);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("데이터를 가져오는 중 오류가 발생했습니다.");
		}
	}
	
	// 적금 계좌 등록
	@PostMapping("/savings/join")
	public ResponseEntity<?> savingsInsert(@RequestBody SavingsDTO dto) {
		System.out.println("컨트롤러 - savingsInsert");
		String generatedAccountNum = depositService.savingsInsert(dto);
		Map<String, String> response = Map.of(
			"message", "Savings successfully inserted",
			"dat_deposit_account_num", generatedAccountNum
		);
		return ResponseEntity.ok(response);
	}
	
	// 입출금 처리
	@PostMapping("/deposit/transaction")
	public ResponseEntity<?> handleTransaction(@RequestBody DepositDTO dto) {
		System.out.println("Received request: " + dto);
		try {
			depositService.processTransaction(dto);
			return ResponseEntity.ok("거래 성공: " + dto.getDat_deposit_account_num() + " 계좌에 " + dto.getDat_new_amount() + "원이 처리되었습니다.");
		} catch (IllegalArgumentException e) {
			System.err.println("Error: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
		}
	}
	


}
