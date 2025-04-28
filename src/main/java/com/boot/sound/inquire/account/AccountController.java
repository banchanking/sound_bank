package com.boot.sound.inquire.account;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService service;

    @GetMapping("/allAccount/{customer_id}")
    public Map<String, List<AccountDTO>> getAllAccounts(@PathVariable String customer_id) {
        return service.getAccountsGroupedByType(customer_id);
    }
    
    // 입출금 계좌 해지
    @PostMapping("/closeAccount/{account_number}")
    public void closeAccount(@PathVariable String account_number) {
        service.closeAccount(account_number);
    }
    
    // 예적금 가입시 계좌정보에 등록
    @PostMapping("/createDepositAccount")
    public ResponseEntity<Map<String, Object>> createDepositAccount(@RequestBody AccountDTO accountDTO) {
        try {
            service.insertDepositAccount(accountDTO);

            Map<String, Object> result = new HashMap<>();
            result.put("accountNumber", accountDTO.getAccountNumber());
            result.put("balance", accountDTO.getBalance()); // ✨ balance도 같이 넘긴다

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("error", "등록 실패: " + e.getMessage()));
        }
    }



    
}
