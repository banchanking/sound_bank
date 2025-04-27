// DepositAutoTransferController.java
package com.boot.sound.deposit.controller;

import com.boot.sound.deposit.dto.DepositAutoTransferDTO;
import com.boot.sound.deposit.service.DepositAutoTransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/deposit/auto-transfer")
public class DepositAutoTransferController {

    private final DepositAutoTransferService depositAutoTransferService;

    // 자동이체 등록
    @PostMapping
    public ResponseEntity<?> createAutoTransfer(@RequestBody DepositAutoTransferDTO dto) {
        depositAutoTransferService.createAutoTransfer(dto);
        return ResponseEntity.ok("자동이체 등록 완료");
    }

    // 자동이체 전체 조회 (특정 고객)
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<DepositAutoTransferDTO>> getAutoTransfersByCustomer(@PathVariable String customerId) {
        List<DepositAutoTransferDTO> list = depositAutoTransferService.getAutoTransfersByCustomerId(customerId);
        return ResponseEntity.ok(list);
    }

    // 자동이체 해지 (삭제)
    @DeleteMapping("/{autoTransferId}")
    public ResponseEntity<?> deleteAutoTransfer(@PathVariable int autoTransferId) {
        depositAutoTransferService.deleteAutoTransfer(autoTransferId);
        return ResponseEntity.ok("자동이체 해지 완료");
    }
}
