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

    public Map<String, List<AccountDTO>> getAccountsGroupedByType(String customer_id) {
        List<AccountDTO> allAccounts = accountDAO.findAllByCustomerId(customer_id);

        // 타입별로 그룹핑
        // LinkedHashMap > 순서 유지를 위해 쓰임 
        Map<String, List<AccountDTO>> grouped = new LinkedHashMap<>();
        
        // 키 값 설정한 빈바구니 미리 만들어둠 
        grouped.put("입출금", new ArrayList<>());
        grouped.put("예금", new ArrayList<>());
        grouped.put("적금", new ArrayList<>());

        // 전체계좌 반복하며 타입별로 분류 
        for (AccountDTO account : allAccounts) {		// 전체 계좌 목록을 하나씩 꺼내서 account라는 변수로 반복
            String type = account.getAccount_type();	// 계좌 타입 확인
            if (grouped.containsKey(type)) {			// 타입이 MAP에 있는 키인지 확인 
                grouped.get(type).add(account);			// 해당타입에 바구니에 추가
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
