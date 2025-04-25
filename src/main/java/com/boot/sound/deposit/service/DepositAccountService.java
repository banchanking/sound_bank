package com.boot.sound.deposit.service;

import com.boot.sound.deposit.dao.DepositAccountDAO;
import com.boot.sound.deposit.dto.DepositAccountDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepositAccountService {
    
    @Autowired
    private DepositAccountDAO depositAccountDAO;
    
    // 계좌 목록 조회
    public List<DepositAccountDTO> getAccountsByCustomerId(String customerId) {
        return depositAccountDAO.findAccountsByCustomerId(customerId);
    }
    
    // 계좌 상세 조회
    public DepositAccountDTO getAccountById(int datId) {
        return depositAccountDAO.findAccountById(datId);
    }
    
    // 계좌 생성
    @Transactional
    public int createAccount(DepositAccountDTO account) {
        return depositAccountDAO.createAccount(account);
    }
    
    // 계좌 수정
    @Transactional
    public int updateAccount(DepositAccountDTO account) {
        return depositAccountDAO.updateAccount(account);
    }
    
    // 계좌 해지
    @Transactional
    public int deleteAccount(int datId) {
        return depositAccountDAO.deleteAccount(datId);
    }
    
    // 자동이체 설정 변경
    @Transactional
    public int updateAutoTransfer(int datId, boolean autoTransfer) {
        return depositAccountDAO.updateAutoTransfer(datId, autoTransfer);
    }
} 