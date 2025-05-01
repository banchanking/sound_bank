package com.boot.sound.inquire.account;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
    
}
