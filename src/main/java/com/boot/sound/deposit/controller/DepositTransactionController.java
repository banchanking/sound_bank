package com.boot.sound.deposit.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.boot.sound.deposit.dto.DepositTransactionDTO;
import com.boot.sound.deposit.service.DepositTransactionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DepositTransactionController {

    private final DepositTransactionService depositTransactionService;

    // 예금 거래 내역 조회
    @GetMapping("/deposit/transactions/deposit")
    public ResponseEntity<?> getDepositTransactions(
            @RequestParam String accountNumber,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            List<DepositTransactionDTO> transactions = depositTransactionService.getDepositTransactions(accountNumber, startDate, endDate);
            return new ResponseEntity<>(transactions, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 거래 내역 조회
    @GetMapping("/deposit/transactions/savings")
    public ResponseEntity<?> getSavingsTransactions(
            @RequestParam String accountNumber,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            List<DepositTransactionDTO> transactions = depositTransactionService.getSavingsTransactions(accountNumber, startDate, endDate);
            return new ResponseEntity<>(transactions, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 거래 내역 상세 조회
    @GetMapping("/deposit/transactions/deposit/{transactionId}")
    public ResponseEntity<?> getDepositTransactionDetail(@PathVariable int transactionId) {
        try {
            DepositTransactionDTO transaction = depositTransactionService.getDepositTransactionDetail(transactionId);
            return new ResponseEntity<>(transaction, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 거래 내역 상세 조회
    @GetMapping("/deposit/transactions/savings/{transactionId}")
    public ResponseEntity<?> getSavingsTransactionDetail(@PathVariable int transactionId) {
        try {
            DepositTransactionDTO transaction = depositTransactionService.getSavingsTransactionDetail(transactionId);
            return new ResponseEntity<>(transaction, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 입금 처리
    @PostMapping("/deposit/transactions/deposit")
    public ResponseEntity<?> deposit(@RequestBody DepositTransactionDTO transaction) {
        try {
            int result = depositTransactionService.deposit(transaction);
            return new ResponseEntity<>("예금 입금이 성공적으로 처리되었습니다. (row: " + result + ")", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 출금 처리
    @PostMapping("/deposit/transactions/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody DepositTransactionDTO transaction) {
        try {
            int result = depositTransactionService.withdraw(transaction);
            return new ResponseEntity<>("예금 출금이 성공적으로 처리되었습니다. (row: " + result + ")", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 입금 처리
    @PostMapping("/deposit/transactions/savings/deposit")
    public ResponseEntity<?> savingsDeposit(@RequestBody DepositTransactionDTO transaction) {
        try {
            int result = depositTransactionService.savingsDeposit(transaction);
            return new ResponseEntity<>("적금 입금이 성공적으로 처리되었습니다. (row: " + result + ")", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 출금 처리
    @PostMapping("/deposit/transactions/savings/withdraw")
    public ResponseEntity<?> savingsWithdraw(@RequestBody DepositTransactionDTO transaction) {
        try {
            int result = depositTransactionService.savingsWithdraw(transaction);
            return new ResponseEntity<>("적금 출금이 성공적으로 처리되었습니다. (row: " + result + ")", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    
    
    // 예금 해지
    @PostMapping("/deposit/accounts/deposit/close")
    public ResponseEntity<?> closeDeposit(@RequestBody DepositTransactionDTO request) {
        try {
        	
        	System.out.println("해지 요청 - 계좌번호: " + request.getAccountNumber());
        	System.out.println("해지 요청 - 비밀번호: " + request.getAccountPassword());

        	depositTransactionService.closeDepositAccount(request);
            return ResponseEntity.ok("예금 계좌 해지 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 해지
    @PostMapping("/deposit/accounts/savings/close")
    public ResponseEntity<?> closeSavings(@RequestBody DepositTransactionDTO request) {
        try {
        	
        	System.out.println("해지 요청 - 계좌번호: " + request.getAccountNumber());
        	System.out.println("해지 요청 - 비밀번호: " + request.getAccountPassword());

        	depositTransactionService.closeSavingsAccount(request);
            return ResponseEntity.ok("적금 계좌 해지 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    

}
