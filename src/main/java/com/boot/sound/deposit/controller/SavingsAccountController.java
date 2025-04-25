package com.boot.sound.deposit.controller;

import com.boot.sound.deposit.dto.SavingsAccountDTO;
import com.boot.sound.deposit.service.SavingsAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/savings/accounts")
public class SavingsAccountController {

    @Autowired
    private SavingsAccountService savingsAccountService;

    // 고객의 적금 계좌 목록 조회
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<SavingsAccountDTO>> getAccountsByCustomerId(@PathVariable String customerId) {
        List<SavingsAccountDTO> accounts = savingsAccountService.getAccountsByCustomerId(customerId);
        return ResponseEntity.ok(accounts);
    }

    // 적금 계좌 상세 조회
    @GetMapping("/{satId}")
    public ResponseEntity<SavingsAccountDTO> getAccountById(@PathVariable int satId) {
        SavingsAccountDTO account = savingsAccountService.getAccountById(satId);
        return ResponseEntity.ok(account);
    }

    // 적금 계좌 생성
    @PostMapping
    public ResponseEntity<Void> createAccount(@RequestBody SavingsAccountDTO account) {
        savingsAccountService.createAccount(account);
        return ResponseEntity.ok().build();
    }

    // 적금 계좌 수정
    @PutMapping("/{satId}")
    public ResponseEntity<Void> updateAccount(@PathVariable int satId, @RequestBody SavingsAccountDTO account) {
        account.setSatId(satId);
        savingsAccountService.updateAccount(account);
        return ResponseEntity.ok().build();
    }

    // 적금 계좌 해지
    @DeleteMapping("/{satId}")
    public ResponseEntity<Void> deleteAccount(@PathVariable int satId) {
        savingsAccountService.deleteAccount(satId);
        return ResponseEntity.ok().build();
    }

    // 자동이체 설정 변경
    @PutMapping("/{satId}/auto-transfer")
    public ResponseEntity<Void> updateAutoTransfer(
            @PathVariable int satId,
            @RequestParam boolean autoTransferEnabled,
            @RequestParam BigDecimal autoTransferAmount,
            @RequestParam Integer autoTransferDay) {
        savingsAccountService.updateAutoTransfer(satId, autoTransferEnabled, autoTransferAmount, autoTransferDay);
        return ResponseEntity.ok().build();
    }
} 