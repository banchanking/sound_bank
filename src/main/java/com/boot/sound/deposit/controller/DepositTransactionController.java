package com.boot.sound.deposit.controller;

import com.boot.sound.deposit.dto.DepositTransactionDTO;
import com.boot.sound.deposit.service.DepositTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/deposit/transactions")
public class DepositTransactionController {
    
    @Autowired
    private DepositTransactionService depositTransactionService;
    
    // 거래내역 조회
    @GetMapping("/account/{datId}")
    public ResponseEntity<List<DepositTransactionDTO>> getTransactionsByAccount(
            @PathVariable int datId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate) {
        List<DepositTransactionDTO> transactions = depositTransactionService.getTransactionsByAccount(datId, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }
    
    // 입금 처리
    @PostMapping("/deposit")
    public ResponseEntity<Integer> deposit(@RequestBody DepositTransactionDTO transaction) {
        int result = depositTransactionService.deposit(transaction);
        return ResponseEntity.ok(result);
    }
    
    // 출금 처리
    @PostMapping("/withdraw")
    public ResponseEntity<Integer> withdraw(@RequestBody DepositTransactionDTO transaction) {
        int result = depositTransactionService.withdraw(transaction);
        return ResponseEntity.ok(result);
    }
} 