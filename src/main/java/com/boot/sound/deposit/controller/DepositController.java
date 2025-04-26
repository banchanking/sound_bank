package com.boot.sound.deposit.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.sound.deposit.dto.DepositDTO;
import com.boot.sound.deposit.service.DepositService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/deposit")
@RequiredArgsConstructor
public class DepositController {
    
    private final DepositService depositService;

    // 예금 상품 목록 조회
    @GetMapping("/products/deposit")
    public List<DepositDTO> getDepositProducts() {
        return depositService.getDepositProducts();
    }

    // 적금 상품 목록 조회
    @GetMapping("/products/savings")
    public List<DepositDTO> getSavingsProducts() {
        return depositService.getSavingsProducts();
    }

    // 예금 계좌 목록 조회
    @GetMapping("/accounts/deposit/{customerId}")
    public List<DepositDTO> getDepositAccounts(@PathVariable String customerId) {
        return depositService.getDepositAccounts(customerId);
    }

    // 적금 계좌 목록 조회
    @GetMapping("/accounts/savings/{customerId}")
    public List<DepositDTO> getSavingsAccounts(@PathVariable String customerId) {
        return depositService.getSavingsAccounts(customerId);
    }

    // 예금 상품 상세 조회
    @GetMapping("/products/deposit/{productId}")
    public DepositDTO getDepositProductDetail(@PathVariable int productId) {
        return depositService.getDepositProductDetail(productId);
    }

    // 적금 상품 상세 조회
    @GetMapping("/products/savings/{productId}")
    public DepositDTO getSavingsProductDetail(@PathVariable int productId) {
        return depositService.getSavingsProductDetail(productId);
    }

    // 예금 계좌 상세 조회
    @GetMapping("/accounts/deposit/detail/{accountId}")
    public DepositDTO getDepositAccountDetail(@PathVariable int accountId) {
        return depositService.getDepositAccountDetail(accountId);
    }

    // 적금 계좌 상세 조회
    @GetMapping("/accounts/savings/detail/{accountId}")
    public DepositDTO getSavingsAccountDetail(@PathVariable int accountId) {
        return depositService.getSavingsAccountDetail(accountId);
    }

    // 예금 계좌 생성
    @PostMapping("/accounts/deposit")
    public ResponseEntity<?> createDepositAccount(@RequestBody DepositDTO account) {
        depositService.createDepositAccount(account);
        return ResponseEntity.ok().body("예금 계좌가 성공적으로 개설되었습니다.");
    }

    // 적금 계좌 생성
    @PostMapping("/accounts/savings")
    public ResponseEntity<?> createSavingsAccount(@RequestBody DepositDTO account) {
        depositService.createSavingsAccount(account);
        return ResponseEntity.ok().body("적금 계좌가 성공적으로 개설되었습니다.");
    }

    // 예금 계좌 해지
    @DeleteMapping("/accounts/deposit/{accountId}")
    public ResponseEntity<?> closeDepositAccount(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.closeDepositAccount(accountId, request.getAccountPassword());
            return ResponseEntity.ok().body("예금 계좌가 성공적으로 해지되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 해지
    @DeleteMapping("/accounts/savings/{accountId}")
    public ResponseEntity<?> closeSavingsAccount(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.closeSavingsAccount(accountId, request.getAccountPassword());
            return ResponseEntity.ok().body("적금 계좌가 성공적으로 해지되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 입금
    @PostMapping("/accounts/deposit/{accountId}/deposit")
    public ResponseEntity<?> deposit(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.deposit(accountId, request.getTransactionAmount());
            return ResponseEntity.ok().body("입금이 성공적으로 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 출금
    @PostMapping("/accounts/deposit/{accountId}/withdraw")
    public ResponseEntity<?> withdraw(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.withdraw(accountId, request.getTransactionAmount());
            return ResponseEntity.ok().body("출금이 성공적으로 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 입금
    @PostMapping("/accounts/savings/{accountId}/deposit")
    public ResponseEntity<?> depositSavings(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.depositSavings(accountId, request.getTransactionAmount());
            return ResponseEntity.ok().body("입금이 성공적으로 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 출금
    @PostMapping("/accounts/savings/{accountId}/withdraw")
    public ResponseEntity<?> withdrawSavings(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.withdrawSavings(accountId, request.getTransactionAmount());
            return ResponseEntity.ok().body("출금이 성공적으로 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 거래 내역 조회
    @GetMapping("/accounts/deposit/{accountId}/transactions")
    public ResponseEntity<?> getDepositTransactions(
            @PathVariable int accountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<DepositDTO> transactions = depositService.getDepositTransactions(accountId, startDate, endDate);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 거래 내역 조회
    @GetMapping("/accounts/savings/{accountId}/transactions")
    public ResponseEntity<?> getSavingsTransactions(
            @PathVariable int accountId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<DepositDTO> transactions = depositService.getSavingsTransactions(accountId, startDate, endDate);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 자동이체 설정
    @PutMapping("/accounts/deposit/{accountId}/auto-transfer")
    public ResponseEntity<?> setAutoTransfer(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.setAutoTransfer(
                    accountId,
                    request.isAutoTransferEnabled(),
                    request.getAutoTransferAmount(),
                    request.getAutoTransferDay());
            return ResponseEntity.ok().body("자동이체 설정이 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 자동이체 처리 (스케줄러용)
    @PostMapping("/auto-transfer/process")
    public ResponseEntity<?> processAutoTransfers() {
        try {
            depositService.processAutoTransfers();
            return ResponseEntity.ok().body("자동이체가 성공적으로 실행되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 만기 처리 (스케줄러용)
    @PostMapping("/savings/maturity/process")
    public ResponseEntity<?> processMaturity() {
        try {
            depositService.processMaturity();
            return ResponseEntity.ok().body("적금 만기 처리가 성공적으로 실행되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 이자 계산 및 지급 (스케줄러용)
    @PostMapping("/interest/payment")
    public ResponseEntity<?> payInterest() {
        try {
            depositService.payInterest();
            return ResponseEntity.ok().body("이자 지급이 성공적으로 실행되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 비밀번호 변경
    @PutMapping("/accounts/deposit/{accountId}/password")
    public ResponseEntity<?> changeDepositAccountPassword(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.changeDepositAccountPassword(accountId, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok().body("예금 계좌 비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 비밀번호 변경
    @PutMapping("/accounts/savings/{accountId}/password")
    public ResponseEntity<?> changeSavingsAccountPassword(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.changeSavingsAccountPassword(accountId, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok().body("적금 계좌 비밀번호가 성공적으로 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
} 