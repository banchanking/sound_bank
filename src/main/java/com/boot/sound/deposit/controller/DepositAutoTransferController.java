package com.boot.sound.deposit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.boot.sound.deposit.dto.DepositAutoTransferDTO;
import com.boot.sound.deposit.service.DepositAutoTransferService;

import java.util.List;

/**
 * DepositAutoTransferController
 * 자동이체 등록/조회/삭제 API 컨트롤러
 */
@RestController
@RequestMapping("/api/auto-transfer")
@RequiredArgsConstructor
public class DepositAutoTransferController {

    private final DepositAutoTransferService autoTransferService;

    /**
     * 자동이체 등록
     * @param transferDTO 등록할 자동이체 정보
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerAutoTransfer(@RequestBody DepositAutoTransferDTO transferDTO) {
        try {
            autoTransferService.registerAutoTransfer(transferDTO);
            return new ResponseEntity<>("자동이체가 성공적으로 등록되었습니다.", HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 고객의 자동이체 리스트 조회
     * @param withdrawAccountNumber 고객 기본계좌 번호
     * @return 자동이체 리스트
     */
    @GetMapping("/list/{withdrawAccountNumber}")
    public ResponseEntity<?> getCustomerAutoTransfers(@PathVariable String withdrawAccountNumber) {
        try {
            List<DepositAutoTransferDTO> transfers = autoTransferService.getCustomerAutoTransfers(withdrawAccountNumber);
            return new ResponseEntity<>(transfers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 자동이체 삭제
     * @param id 자동이체 ID
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteAutoTransfer(@PathVariable Long id) {
        try {
            autoTransferService.deleteAutoTransfer(id);
            return new ResponseEntity<>("자동이체가 성공적으로 삭제되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
