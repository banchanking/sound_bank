// DepositAutoTransferController.java
package com.boot.sound.deposit.controller;


import lombok.RequiredArgsConstructor;
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
    public void registerAutoTransfer(@RequestBody DepositAutoTransferDTO transferDTO) {
        autoTransferService.registerAutoTransfer(transferDTO);
    }

    /**
     * 고객의 자동이체 리스트 조회
     * @param withdrawAccountNumber 고객 기본계좌 번호
     * @return 자동이체 리스트
     */
    @GetMapping("/list/{withdrawAccountNumber}")
    public List<DepositAutoTransferDTO> getCustomerAutoTransfers(@PathVariable String withdrawAccountNumber) {
        return autoTransferService.getCustomerAutoTransfers(withdrawAccountNumber);
    }

    /**
     * 자동이체 삭제
     * @param id 자동이체 ID
     */
    @DeleteMapping("/delete/{id}")
    public void deleteAutoTransfer(@PathVariable Long id) {
        autoTransferService.deleteAutoTransfer(id);
    }
}