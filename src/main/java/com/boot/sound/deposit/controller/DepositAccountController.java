package com.boot.sound.deposit.controller;

import com.boot.sound.deposit.dto.DepositAccountDTO;
import com.boot.sound.deposit.service.DepositAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deposit/accounts")
public class DepositAccountController {
    
    @Autowired
    private DepositAccountService depositAccountService;
    
    // 계좌 목록 조회
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<DepositAccountDTO>> getAccountsByCustomerId(@PathVariable String customerId) {
        List<DepositAccountDTO> accounts = depositAccountService.getAccountsByCustomerId(customerId);
        return ResponseEntity.ok(accounts);
    }
    
    // 계좌 상세 조회
    @GetMapping("/{datId}")
    public ResponseEntity<DepositAccountDTO> getAccountById(@PathVariable int datId) {
        DepositAccountDTO account = depositAccountService.getAccountById(datId);
        return ResponseEntity.ok(account);
    }
    
    // 계좌 생성
    @PostMapping
    public ResponseEntity<Integer> createAccount(@RequestBody DepositAccountDTO account) {
        int result = depositAccountService.createAccount(account);
        return ResponseEntity.ok(result);
    }
    
    // 계좌 수정
    @PutMapping("/{datId}")
    public ResponseEntity<Integer> updateAccount(@PathVariable int datId, @RequestBody DepositAccountDTO account) {
        account.setDatId(datId);
        int result = depositAccountService.updateAccount(account);
        return ResponseEntity.ok(result);
    }
    
    // 계좌 해지
    @DeleteMapping("/{datId}")
    public ResponseEntity<Integer> deleteAccount(@PathVariable int datId) {
        int result = depositAccountService.deleteAccount(datId);
        return ResponseEntity.ok(result);
    }
    
    // 자동이체 설정 변경
    @PutMapping("/{datId}/auto-transfer")
    public ResponseEntity<Integer> updateAutoTransfer(
            @PathVariable int datId,
            @RequestParam boolean autoTransfer) {
        int result = depositAccountService.updateAutoTransfer(datId, autoTransfer);
        return ResponseEntity.ok(result);
    }
} 