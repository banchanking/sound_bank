package com.boot.sound.deposit.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public List<DepositTransactionDTO> getDepositTransactions(
            @RequestParam String accountNumber,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return depositTransactionService.getDepositTransactions(accountNumber, startDate, endDate);
    }

    // 적금 거래 내역 조회
    @GetMapping("/deposit/transactions/savings")
    public List<DepositTransactionDTO> getSavingsTransactions(
            @RequestParam String accountNumber,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return depositTransactionService.getSavingsTransactions(accountNumber, startDate, endDate);
    }

    // 예금 거래 내역 상세 조회
    @GetMapping("/deposit/transactions/deposit/{transactionId}")
    public DepositTransactionDTO getDepositTransactionDetail(@PathVariable int transactionId) {
        return depositTransactionService.getDepositTransactionDetail(transactionId);
    }

    // 적금 거래 내역 상세 조회
    @GetMapping("/deposit/transactions/savings/{transactionId}")
    public DepositTransactionDTO getSavingsTransactionDetail(@PathVariable int transactionId) {
        return depositTransactionService.getSavingsTransactionDetail(transactionId);
    }

    // 예금 입금 처리
    @PostMapping("/deposit/transactions/deposit")
    public ResponseEntity<Integer> deposit(@RequestBody DepositTransactionDTO transaction) {
        int result = depositTransactionService.deposit(transaction);
        return ResponseEntity.ok(result);
    }
    
    // 예금 출금 처리
    @PostMapping("/deposit/transactions/withdraw")
    public ResponseEntity<Integer> withdraw(@RequestBody DepositTransactionDTO transaction) {
        int result = depositTransactionService.withdraw(transaction);
        return ResponseEntity.ok(result);
    }
    
    // 적금 입금 처리
    @PostMapping("/deposit/transactions/savings/deposit")
    public ResponseEntity<Integer> savingsDeposit(@RequestBody DepositTransactionDTO transaction) {
        int result = depositTransactionService.savingsDeposit(transaction);
        return ResponseEntity.ok(result);
    }
} 