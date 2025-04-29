package com.boot.sound.inquire.account;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.customer.CustomerService;
import com.boot.sound.jwt.mappers.CustomerMapper;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AccountService {
   
   private final CustomerMapper customerMapper;  
    private final CustomerService customerService; // 회원탈퇴시 사용

    @Autowired
    private AccountDAO accountDAO;
    private final AccountRepository accountRepository;

 // 입출금, 예금, 적금 따로 조회해서 그룹핑
    public Map<String, List<AccountDTO>> getAccountsGroupedByType(String customer_id) {
        List<AccountDTO> demandDepositAccounts = accountDAO.findAllByCustomerId(customer_id); // 입출금
        List<AccountDTO> depositAccounts = accountDAO.findDepositAccounts(customer_id);       // 예금
        List<AccountDTO> savingsAccounts = accountDAO.findSavingsAccounts(customer_id);       // 적금

        Map<String, List<AccountDTO>> grouped = new LinkedHashMap<>();
        grouped.put("입출금", demandDepositAccounts);
        grouped.put("예금", depositAccounts);
        grouped.put("적금", savingsAccounts);

        // 전체계좌 반복하며 타입별로 분류 
        for (AccountDTO account : allAccounts) {      // 전체 계좌 목록을 하나씩 꺼내서 account라는 변수로 반복
            String type = account.getAccount_type();   // 계좌 타입 확인
            if (grouped.containsKey(type)) {         // 타입이 MAP에 있는 키인지 확인 
                grouped.get(type).add(account);         // 해당타입에 바구니에 추가
            }
        }

        return grouped;
    }
    
    // 대출금 이자 자동이체
    public void withdraw(String accountNumber, BigDecimal amount) {
        // 계좌 조회
        AccountDTO account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("계좌를 찾을 수 없습니다"));

        BigDecimal currentBalance = account.getBalance();

        // 잔액 부족 확인
        if (currentBalance.compareTo(amount) < 0) {
            throw new RuntimeException("계좌 잔액 부족");
        }

        // 잔액 차감
        account.setBalance(currentBalance.subtract(amount));
        accountRepository.save(account);
    }
    
    // 입금 처리
    public void deposit(String accountNumber, BigDecimal amount) {
        int updated = accountRepository.plusBalance(accountNumber, amount);
        if (updated == 0) {
            throw new IllegalStateException("입금 실패 - 존재하지 않거나 비정상 계좌입니다.");
        }
    }
    
    // 입출금 계좌 해지
    @Transactional
    public void closeAccount(String account_number) {
        AccountDTO account = accountRepository.findByAccountNumber(account_number)
                .orElseThrow(() -> new RuntimeException("계좌를 찾을 수 없습니다."));

        if (account.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new RuntimeException("잔액이 0원이 아닙니다. 타행 본인계좌로 이체 진행후 해지해주세요.");
        }

        accountDAO.deleteAccount(account_number); 
        
    }
    
}
