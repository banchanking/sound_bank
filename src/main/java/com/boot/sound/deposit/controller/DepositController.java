package com.boot.sound.deposit.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
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
import com.boot.sound.deposit.dto.DepositTransactionDTO;
import com.boot.sound.deposit.service.DepositService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class DepositController {
    
    private final DepositService depositService;

    // 예금 상품 목록 조회
    @GetMapping("/deposit/products/deposit")
    public ResponseEntity<?> getDepositProducts() {
        return new ResponseEntity<>(depositService.getDepositProducts(), HttpStatus.OK);
    }

    // 적금 상품 목록 조회
    @GetMapping("/deposit/products/savings")
    public ResponseEntity<?> getSavingsProducts() {
        return new ResponseEntity<>(depositService.getSavingsProducts(), HttpStatus.OK);
    }

    // 예금 계좌 목록 조회
    @GetMapping("/deposit/accounts/deposit")
    public ResponseEntity<?> getDepositAccounts(@RequestParam String customerId) {
        return new ResponseEntity<>(depositService.getDepositAccounts(customerId), HttpStatus.OK);
    }

    // 적금 계좌 목록 조회
    @GetMapping("/deposit/accounts/savings/{customerId}")
    public ResponseEntity<?> getSavingsAccounts(@PathVariable String customerId) {
        return new ResponseEntity<>(depositService.getSavingsAccounts(customerId), HttpStatus.OK);
    }

    // 예금 상품 상세 조회
    @GetMapping("/deposit/products/deposit/{productId}")
    public ResponseEntity<?> getDepositProductDetail(@PathVariable int productId) {
        return new ResponseEntity<>(depositService.getDepositProductDetail(productId), HttpStatus.OK);
    }

    // 적금 상품 상세 조회
    @GetMapping("/deposit/products/savings/{productId}")
    public ResponseEntity<?> getSavingsProductDetail(@PathVariable int productId) {
        return new ResponseEntity<>(depositService.getSavingsProductDetail(productId), HttpStatus.OK);
    }

 // 예금 계좌 상세 조회 (accountId가 String이라면 String으로)
    @GetMapping("/deposit/accounts/deposit/detail/{accountId}")
    public ResponseEntity<?> getDepositAccountDetail(@PathVariable int accountId) {
        return new ResponseEntity<>(depositService.getDepositAccountDetail(accountId), HttpStatus.OK);
    }

    // 적금 계좌 상세 조회 (accountId가 String이라면 String으로)
    @GetMapping("/deposit/accounts/savings/detail/{accountId}")
    public ResponseEntity<?> getSavingsAccountDetail(@PathVariable int accountId) {
        return new ResponseEntity<>(depositService.getSavingsAccountDetail(accountId), HttpStatus.OK);
    }


    // 예금계좌생성
    @PostMapping("/deposit/accounts/deposit")
    public ResponseEntity<?> createDepositAccount(@RequestBody DepositDTO dto) {
        String accountNumber = depositService.createDepositAccount(dto);
        Map<String, String> response = new HashMap<>();
        response.put("accountNumber", accountNumber);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 적금계좌생성
    @PostMapping("/deposit/accounts/savings")
    public ResponseEntity<?> createSavingsAccount(@RequestBody DepositDTO dto) {
        String accountNumber = depositService.createSavingsAccount(dto);
        Map<String, String> response = new HashMap<>();
        response.put("accountNumber", accountNumber);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 예금 계좌 해지
    @PostMapping("/deposit/accounts/deposit/close")
    public ResponseEntity<?> closeDepositAccount(@RequestBody DepositTransactionDTO request) {
        try {
            depositService.closeDepositAccount(request.getAccountNumber(), request.getAccountPassword());
            return new ResponseEntity<>("예금 계좌가 성공적으로 해지되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 해지
    @PostMapping("/deposit/accounts/savings/close")
    public ResponseEntity<?> closeSavingsAccount(@RequestBody DepositTransactionDTO request) {
        try {
            depositService.closeSavingsAccount(request.getAccountNumber(), request.getAccountPassword());
            return new ResponseEntity<>("적금 계좌가 성공적으로 해지되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 입금
    @PostMapping("/deposit/accounts/deposit/{accountId}/deposit")
    public ResponseEntity<?> deposit(@PathVariable int accountId, @RequestBody DepositDTO request) {
        try {
            depositService.deposit(accountId, request.getTransactionAmount(), request.getAccountPassword());
            return new ResponseEntity<>("입금이 성공적으로 처리되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
        	e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 출금
    @PostMapping("/deposit/accounts/deposit/{accountId}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable int accountId, @RequestBody DepositDTO request) {
        try {
            depositService.withdraw(accountId, request.getTransactionAmount(), request.getAccountPassword());
            return new ResponseEntity<>("출금이 성공적으로 처리되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
        	e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 입금
    @PostMapping("/deposit/accounts/savings/{accountId}/deposit")
    public ResponseEntity<?> depositSavings(@PathVariable int accountId, @RequestBody DepositDTO request) {
        try {
            depositService.depositSavings(accountId, request.getTransactionAmount(), request.getAccountPassword());
            return new ResponseEntity<>("적금 계좌 입금이 성공적으로 처리되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
        	e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 출금
    @PostMapping("/deposit/accounts/savings/{accountId}/withdraw")
    public ResponseEntity<?> withdrawSavings(@PathVariable int accountId, @RequestBody DepositDTO request) {
        try {
            depositService.withdrawSavings(accountId, request.getTransactionAmount(), request.getAccountPassword());
            return new ResponseEntity<>("적금 계좌 출금이 성공적으로 처리되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
        	e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 거래내역 조회
    @GetMapping("/deposit/accounts/deposit/{accountId}/transactions")
    public ResponseEntity<?> getDepositTransactions(@PathVariable int accountId, @RequestParam String startDate, @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            List<DepositDTO> transactions = depositService.getDepositTransactions(accountId, start, end);
            return new ResponseEntity<>(transactions, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 거래내역 조회
    @GetMapping("/deposit/accounts/savings/{accountId}/transactions")
    public ResponseEntity<?> getSavingsTransactions(@PathVariable int accountId, @RequestParam String startDate, @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDate.parse(startDate).atStartOfDay();
            LocalDateTime end = LocalDate.parse(endDate).atTime(23, 59, 59);
            List<DepositDTO> transactions = depositService.getSavingsTransactions(accountId, start, end);
            return new ResponseEntity<>(transactions, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    // 예금 계좌 비밀번호 변경
    @PutMapping("/deposit/accounts/deposit/{accountId}/password")
    public ResponseEntity<?> changeDepositAccountPassword(@PathVariable int accountId, @RequestBody DepositDTO request) {
        try {
            depositService.changeDepositAccountPassword(accountId, request.getOldPassword(), request.getNewPassword());
            return new ResponseEntity<>("예금 계좌 비밀번호가 성공적으로 변경되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 비밀번호 변경
    @PutMapping("/deposit/accounts/savings/{accountId}/password")
    public ResponseEntity<?> changeSavingsAccountPassword(@PathVariable int accountId, @RequestBody DepositDTO request) {
        try {
            depositService.changeSavingsAccountPassword(accountId, request.getOldPassword(), request.getNewPassword());
            return new ResponseEntity<>("적금 계좌 비밀번호가 성공적으로 변경되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 별명 변경
    @PutMapping("/deposit/accounts/deposit/{accountId}/nickname")
    public ResponseEntity<?> updateNickname(@PathVariable String accountId, @RequestBody DepositDTO depositDTO) {
        try {
            depositService.updateDepositAccountNickname(accountId, depositDTO.getNickname());
            return new ResponseEntity<>("계좌 별명이 변경되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 별명 변경
    @PutMapping("/deposit/accounts/savings/{accountId}/nickname")
    public ResponseEntity<?> updateSavingsNickname(@PathVariable String accountId, @RequestBody DepositDTO depositDTO) {
        try {
            depositService.updateSavingsAccountNickname(accountId, depositDTO.getNickname());
            return new ResponseEntity<>("적금 계좌 별명이 변경되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 상품 추가
    @PostMapping("/deposit/products/deposit")
    public ResponseEntity<?> createDepositProduct(@RequestBody DepositDTO product) {
        try {
            depositService.addDepositProduct(product);
            return new ResponseEntity<>("예금 상품이 성공적으로 추가되었습니다.", HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 상품 수정
    @PutMapping("/deposit/products/deposit/{productId}")
    public ResponseEntity<?> updateDepositProduct(@PathVariable int productId, @RequestBody DepositDTO product) {
        try {
            depositService.updateDepositProduct(productId, product);
            return new ResponseEntity<>("예금 상품이 성공적으로 수정되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 상품 삭제
    @DeleteMapping("/deposit/products/deposit/{productId}")
    public ResponseEntity<?> deleteDepositProduct(@PathVariable String productId) {
        try {
            depositService.deleteDepositProduct(productId);
            return new ResponseEntity<>("예금 상품이 성공적으로 삭제되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 상품 추가
    @PostMapping("/deposit/products/savings")
    public ResponseEntity<?> createSavingsProduct(@RequestBody DepositDTO product) {
        try {
            depositService.addSavingsProduct(product);
            return new ResponseEntity<>("적금 상품이 성공적으로 추가되었습니다.", HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 상품 수정
    @PutMapping("/deposit/products/savings/{productId}")
    public ResponseEntity<?> updateSavingsProduct(@PathVariable int productId, @RequestBody DepositDTO product) {
        try {
            depositService.updateSavingsProduct(productId, product);
            return new ResponseEntity<>("적금 상품이 성공적으로 수정되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 상품 삭제
    @DeleteMapping("/deposit/products/savings/{productId}")
    public ResponseEntity<?> deleteSavingsProduct(@PathVariable String productId) {
        try {
            depositService.deleteSavingsProduct(productId);
            return new ResponseEntity<>("적금 상품이 성공적으로 삭제되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금계좌 목록조회 (고객 ID 기준)
    @GetMapping("/deposit/accounts/customer/{customerId}")
    public ResponseEntity<?> getDepositAccountsByCustomerId(@PathVariable String customerId) {
        try {
            return new ResponseEntity<>(depositService.getDepositAccounts(customerId), HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 목록조회 (고객 ID 기준)
    @GetMapping("/savings/accounts/customer/{customerId}")
    public ResponseEntity<?> getSavingsAccountsByCustomerId(@PathVariable String customerId) {
        try {
            return new ResponseEntity<>(depositService.getSavingsAccounts(customerId), HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 예금 계좌 잔액 조회
    @GetMapping("/deposit/accounts/balance/{accountNumber}")
    public ResponseEntity<?> getDepositAccountBalanceByAccountNumber(@PathVariable String accountNumber) {
        try {
            return new ResponseEntity<>(depositService.getDepositAccountBalanceByAccountNumber(accountNumber), HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 적금 계좌 잔액 조회
    @GetMapping("/savings/accounts/balance/{accountNumber}")
    public ResponseEntity<?> getSavingsAccountBalanceByAccountNumber(@PathVariable String accountNumber) {
        try {
            return new ResponseEntity<>(depositService.getSavingsAccountBalanceByAccountNumber(accountNumber), HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
 


} 