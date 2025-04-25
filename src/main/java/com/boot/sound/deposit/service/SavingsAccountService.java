package com.boot.sound.deposit.service;

import com.boot.sound.deposit.dao.SavingsAccountDAO;
import com.boot.sound.deposit.dto.SavingsAccountDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SavingsAccountService {

    @Autowired
    private SavingsAccountDAO savingsAccountDAO;

    // 계좌 목록 조회
    public List<SavingsAccountDTO> getAccountsByCustomerId(String customerId) {
        return savingsAccountDAO.findAccountsByCustomerId(customerId);
    }

    // 계좌 상세 조회
    public SavingsAccountDTO getAccountById(int satId) {
        return savingsAccountDAO.findAccountById(satId);
    }

    // 계좌 생성
    public void createAccount(SavingsAccountDTO account) {
        savingsAccountDAO.createAccount(account);
    }

    // 계좌 수정
    public void updateAccount(SavingsAccountDTO account) {
        savingsAccountDAO.updateAccount(account);
    }

    // 계좌 해지
    public void deleteAccount(int satId) {
        savingsAccountDAO.deleteAccount(satId);
    }
} 