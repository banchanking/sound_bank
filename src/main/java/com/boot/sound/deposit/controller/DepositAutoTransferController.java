package com.boot.sound.deposit.controller;

import com.boot.sound.deposit.dto.DepositAutoTransferDTO;
import com.boot.sound.deposit.service.DepositAutoTransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deposit/auto-transfers")
public class DepositAutoTransferController {
    
    @Autowired
    private DepositAutoTransferService depositAutoTransferService;
    
    // 자동이체 목록 조회
    @GetMapping("/account/{datId}")
    public ResponseEntity<List<DepositAutoTransferDTO>> getAutoTransfersByAccount(@PathVariable int datId) {
        List<DepositAutoTransferDTO> autoTransfers = depositAutoTransferService.getAutoTransfersByAccount(datId);
        return ResponseEntity.ok(autoTransfers);
    }
    
    // 자동이체 상세 조회
    @GetMapping("/{autoTransferId}")
    public ResponseEntity<DepositAutoTransferDTO> getAutoTransferById(@PathVariable int autoTransferId) {
        DepositAutoTransferDTO autoTransfer = depositAutoTransferService.getAutoTransferById(autoTransferId);
        return ResponseEntity.ok(autoTransfer);
    }
    
    // 자동이체 생성
    @PostMapping
    public ResponseEntity<Integer> createAutoTransfer(@RequestBody DepositAutoTransferDTO autoTransfer) {
        int result = depositAutoTransferService.createAutoTransfer(autoTransfer);
        return ResponseEntity.ok(result);
    }
    
    // 자동이체 수정
    @PutMapping("/{autoTransferId}")
    public ResponseEntity<Integer> updateAutoTransfer(
            @PathVariable int autoTransferId,
            @RequestBody DepositAutoTransferDTO autoTransfer) {
        autoTransfer.setAutoTransferId(autoTransferId);
        int result = depositAutoTransferService.updateAutoTransfer(autoTransfer);
        return ResponseEntity.ok(result);
    }
    
    // 자동이체 삭제
    @DeleteMapping("/{autoTransferId}")
    public ResponseEntity<Integer> deleteAutoTransfer(@PathVariable int autoTransferId) {
        int result = depositAutoTransferService.deleteAutoTransfer(autoTransferId);
        return ResponseEntity.ok(result);
    }
    
    // 자동이체 실행
    @PostMapping("/{autoTransferId}/execute")
    public ResponseEntity<Void> executeAutoTransfer(@PathVariable int autoTransferId) {
        DepositAutoTransferDTO autoTransfer = depositAutoTransferService.getAutoTransferById(autoTransferId);
        depositAutoTransferService.executeAutoTransfer(autoTransfer);
        return ResponseEntity.ok().build();
    }
    
    // 자동이체 상태 변경
    @PutMapping("/{autoTransferId}/status")
    public ResponseEntity<Integer> updateAutoTransferStatus(
            @PathVariable int autoTransferId,
            @RequestParam String status) {
        int result = depositAutoTransferService.updateAutoTransferStatus(autoTransferId, status);
        return ResponseEntity.ok(result);
    }
} 