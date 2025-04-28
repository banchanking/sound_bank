package com.boot.sound.deposit.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

import com.boot.sound.deposit.dto.AccountCloseRequest;
import com.boot.sound.deposit.dto.DepositDTO;
import com.boot.sound.deposit.service.DepositService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DepositController {
    
    private final DepositService depositService;

    // 예금 상품 목록 조회
    @GetMapping("/deposit/products/deposit")
    public List<DepositDTO> getDepositProducts() {
        return depositService.getDepositProducts();
    }

    // 적금 상품 목록 조회
    @GetMapping("/deposit/products/savings")
    public List<DepositDTO> getSavingsProducts() {
        return depositService.getSavingsProducts();
    }

    // 예금 계좌 목록 조회
    @GetMapping("/deposit/accounts/deposit/{customerId}")
    public List<DepositDTO> getDepositAccounts(@PathVariable String customerId) {
        return depositService.getDepositAccounts(customerId);
    }

    // 적금 계좌 목록 조회
    @GetMapping("/deposit/accounts/savings/{customerId}")
    public List<DepositDTO> getSavingsAccounts(@PathVariable String customerId) {
        return depositService.getSavingsAccounts(customerId);
    }

    // 예금 상품 상세 조회
    @GetMapping("/deposit/products/deposit/{productId}")
    public DepositDTO getDepositProductDetail(@PathVariable int productId) {
        return depositService.getDepositProductDetail(productId);
    }

    // 적금 상품 상세 조회
    @GetMapping("/deposit/products/savings/{productId}")
    public DepositDTO getSavingsProductDetail(@PathVariable int productId) {
        return depositService.getSavingsProductDetail(productId);
    }

    // 예금 계좌 상세 조회
    @GetMapping("/deposit/accounts/deposit/detail/{accountId}")
    public DepositDTO getDepositAccountDetail(@PathVariable int accountId) {
        return depositService.getDepositAccountDetail(accountId);
    }

    // 적금 계좌 상세 조회
    @GetMapping("/deposit/accounts/savings/detail/{accountId}")
    public DepositDTO getSavingsAccountDetail(@PathVariable int accountId) {
        return depositService.getSavingsAccountDetail(accountId);
    }
    
    
    // 예금계좌생성
    @PostMapping("/deposit/accounts/deposit")
    public ResponseEntity<Map<String, String>> createDepositAccount(@RequestBody DepositDTO dto) {
        String accountNumber = depositService.createDepositAccount(dto);
        Map<String, String> response = new HashMap<>();
        response.put("accountNumber", accountNumber);
        return ResponseEntity.ok(response);
    }

    // 적금계좌생성
    @PostMapping("/deposit/accounts/savings")
    public ResponseEntity<Map<String, String>> createSavingsAccount(@RequestBody DepositDTO dto) {
        String accountNumber = depositService.createSavingsAccount(dto);
        Map<String, String> response = new HashMap<>();
        response.put("accountNumber", accountNumber);
        return ResponseEntity.ok(response);
    }



    //  예금 계좌 해지
    @PutMapping("/deposit/accounts/deposit/{selectAcount}/close")
    public ResponseEntity<?> closeDepositAccount(
    	@PathVariable("accountId") String accountId,
        @RequestBody DepositDTO request
    ) {
        try {
            String accountPassword = request.getAccountPassword();
            depositService.closeDepositAccount(accountId, accountPassword);
            return ResponseEntity.ok("예금 계좌가 성공적으로 해지되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //  적금 계좌 해지
    @PutMapping("/deposit/accounts/savings/{selectAcount}/close")
    public ResponseEntity<?> closeSavingsAccount(
    	@PathVariable("accountId") String accountId,
        @RequestBody DepositDTO request
    ) {
        try {
            String accountPassword = request.getAccountPassword();
            depositService.closeSavingsAccount(accountId, accountPassword);
            return ResponseEntity.ok("적금 계좌가 성공적으로 해지되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }





 // ✅ 예금 계좌 입금
    @PostMapping("/deposit/accounts/deposit/{accountId}/deposit")
    public ResponseEntity<?> deposit(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.deposit(accountId, request.getTransactionAmount(), request.getAccountPassword());
            return ResponseEntity.ok().body("입금이 성공적으로 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ 예금 계좌 출금
    @PostMapping("/deposit/accounts/deposit/{accountId}/withdraw")
    public ResponseEntity<?> withdraw(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.withdraw(accountId, request.getTransactionAmount(), request.getAccountPassword());
            return ResponseEntity.ok().body("출금이 성공적으로 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ 적금 계좌 입금
    @PostMapping("/deposit/accounts/savings/{accountId}/deposit")
    public ResponseEntity<?> depositSavings(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.depositSavings(accountId, request.getTransactionAmount(), request.getAccountPassword());
            return ResponseEntity.ok().body("적금 계좌 입금이 성공적으로 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ 적금 계좌 출금
    @PostMapping("/deposit/accounts/savings/{accountId}/withdraw")
    public ResponseEntity<?> withdrawSavings(
            @PathVariable int accountId,
            @RequestBody DepositDTO request) {
        try {
            depositService.withdrawSavings(accountId, request.getTransactionAmount(), request.getAccountPassword());
            return ResponseEntity.ok().body("적금 계좌 출금이 성공적으로 처리되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



 // 예금 거래내역 조회
    @GetMapping("/deposit/accounts/deposit/{accountId}/transactions")
    public ResponseEntity<?> getDepositTransactions(
            @PathVariable int accountId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            List<DepositDTO> transactions = depositService.getDepositTransactions(accountId, start, end);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 거래내역 조회
    @GetMapping("/deposit/accounts/savings/{accountId}/transactions")
    public ResponseEntity<?> getSavingsTransactions(
            @PathVariable int accountId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            List<DepositDTO> transactions = depositService.getSavingsTransactions(accountId, start, end);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



    // 예금 계좌 자동이체 설정
    @PutMapping("/deposit/accounts/deposit/{accountId}/auto-transfer")
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
    @PostMapping("/deposit/auto-transfer/process")
    public ResponseEntity<?> processAutoTransfers() {
        try {
            depositService.processAutoTransfers();
            return ResponseEntity.ok().body("자동이체가 성공적으로 실행되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 만기 처리 (스케줄러용)
    @PostMapping("/deposit/savings/maturity/process")
    public ResponseEntity<?> processMaturity() {
        try {
            depositService.processMaturity();
            return ResponseEntity.ok().body("적금 만기 처리가 성공적으로 실행되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 이자 계산 및 지급 (스케줄러용)
    @PostMapping("/deposit/interest/payment")
    public ResponseEntity<?> payInterest() {
        try {
            depositService.payInterest();
            return ResponseEntity.ok().body("이자 지급이 성공적으로 실행되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 비밀번호 변경
    @PutMapping("/deposit/accounts/deposit/{accountId}/password")
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
    @PutMapping("/deposit/accounts/savings/{accountId}/password")
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
    
    // 예금 계좌 별명 변경
    @PutMapping("/deposit/accounts/deposit/{accountId}/nickname")
    public ResponseEntity<?> updateNickname(
            @PathVariable String accountId,
            @RequestBody DepositDTO depositDTO) {
        try {
            depositService.updateDepositAccountNickname(accountId, depositDTO.getNickname());
            return ResponseEntity.ok("계좌 별명이 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // 적금 계좌 별명 변경
    @PutMapping("/deposit/accounts/savings/{accountId}/nickname")
    public ResponseEntity<?> updateSavingsNickname(
            @PathVariable String accountId,
            @RequestBody DepositDTO depositDTO) {
        try {
            depositService.updateSavingsAccountNickname(accountId, depositDTO.getNickname());
            return ResponseEntity.ok("적금 계좌 별명이 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    // 예금 상품 추가
    @PostMapping("/deposit/products/deposit")
    public ResponseEntity<?> createDepositProduct(@RequestBody DepositDTO product) {
        try {
            depositService.addDepositProduct(product);
            return ResponseEntity.ok().body("예금 상품이 성공적으로 추가되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 상품 수정
    @PutMapping("/deposit/products/deposit/{productId}")
    public ResponseEntity<?> updateDepositProduct(
            @PathVariable int productId,
            @RequestBody DepositDTO product) {
        try {
            depositService.updateDepositProduct(productId, product);
            return ResponseEntity.ok().body("예금 상품이 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 상품 삭제
    @DeleteMapping("/deposit/products/deposit/{productId}")
    public ResponseEntity<?> deleteDepositProduct(@PathVariable String productId) {
        try {
            depositService.deleteDepositProduct(productId);
            return ResponseEntity.ok().body("예금 상품이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
 // 적금 상품 추가
    @PostMapping("/deposit/products/savings")
    public ResponseEntity<?> createSavingsProduct(@RequestBody DepositDTO product) {
        try {
            depositService.addSavingsProduct(product);
            return ResponseEntity.ok().body("적금 상품이 성공적으로 추가되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 상품 수정
    @PutMapping("/deposit/products/savings/{productId}")
    public ResponseEntity<?> updateSavingsProduct(
            @PathVariable int productId,
            @RequestBody DepositDTO product) {
        try {
            depositService.updateSavingsProduct(productId, product);
            return ResponseEntity.ok().body("적금 상품이 성공적으로 수정되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 상품 삭제
    @DeleteMapping("/deposit/products/savings/{productId}")
    public ResponseEntity<?> deleteSavingsProduct(@PathVariable String productId) {
        try {
            depositService.deleteSavingsProduct(productId);
            return ResponseEntity.ok().body("적금 상품이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
 // 예금계좌 목록조회
    @GetMapping("/deposit/accounts/customer/{customerId}")
    public ResponseEntity<?> getDepositAccountsByCustomerId(@PathVariable String customerId) {
        try {
            List<DepositDTO> accounts = depositService.getDepositAccounts(customerId);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 목록조회
    @GetMapping("/savings/accounts/customer/{customerId}")
    public ResponseEntity<?> getSavingsAccountsByCustomerId(@PathVariable String customerId) {
        try {
            List<DepositDTO> accounts = depositService.getSavingsAccounts(customerId);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    
    // 예금 계좌로 잔액조회
    @GetMapping("/deposit/accounts/balance/{accountNumber}")
    public ResponseEntity<?> getDepositAccountBalanceByAccountNumber(@PathVariable String accountNumber) {
        try {
            BigDecimal balance = depositService.getDepositAccountBalanceByAccountNumber(accountNumber);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 잔액 조회 (accountNumber 기준)
    @GetMapping("/savings/accounts/balance/{accountNumber}")
    public ResponseEntity<?> getSavingsAccountBalanceByAccountNumber(@PathVariable String accountNumber) {
        try {
            BigDecimal balance = depositService.getSavingsAccountBalanceByAccountNumber(accountNumber);
            return ResponseEntity.ok(balance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    






    
    

} 