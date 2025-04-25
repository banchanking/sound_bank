package com.boot.sound.deposit.service;

import com.boot.sound.deposit.dao.DepositAccountDAO;
import com.boot.sound.deposit.dao.DepositAutoTransferDAO;
import com.boot.sound.deposit.dao.DepositTransactionDAO;
import com.boot.sound.deposit.dto.DepositAccountDTO;
import com.boot.sound.deposit.dto.DepositAutoTransferDTO;
import com.boot.sound.deposit.dto.DepositTransactionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

/**
 * 예금/적금 자동이체 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 
 * @author 홍길동
 * @since 2024.03
 */
@Service
public class DepositAutoTransferService {
    
    private final DepositAutoTransferDAO depositAutoTransferDAO;
    
    @Autowired
    private DepositAccountDAO depositAccountDAO;
    
    @Autowired
    private DepositTransactionDAO depositTransactionDAO;
    
    /**
     * 생성자를 통한 의존성 주입
     * 
     * @param depositAutoTransferDAO 자동이체 DAO
     */
    @Autowired
    public DepositAutoTransferService(DepositAutoTransferDAO depositAutoTransferDAO) {
        this.depositAutoTransferDAO = depositAutoTransferDAO;
    }
    
    // 자동이체 목록 조회
    public List<DepositAutoTransferDTO> getAutoTransfersByAccount(int datId) {
        return depositAutoTransferDAO.findAutoTransfersByAccount(datId);
    }
    
    // 자동이체 상세 조회
    public DepositAutoTransferDTO getAutoTransferById(int autoTransferId) {
        return depositAutoTransferDAO.findAutoTransferById(autoTransferId);
    }
    
    // 자동이체 생성
    @Transactional
    public int createAutoTransfer(DepositAutoTransferDTO autoTransfer) {
        // 출금계좌 확인
        DepositAccountDTO fromAccount = depositAccountDAO.findAccountById(autoTransfer.getDatId());
        if (fromAccount == null) {
            throw new RuntimeException("출금계좌가 존재하지 않습니다.");
        }
        
        // 자동이체 생성
        return depositAutoTransferDAO.createAutoTransfer(autoTransfer);
    }
    
    // 자동이체 수정
    @Transactional
    public int updateAutoTransfer(DepositAutoTransferDTO autoTransfer) {
        return depositAutoTransferDAO.updateAutoTransfer(autoTransfer);
    }
    
    // 자동이체 삭제
    @Transactional
    public int deleteAutoTransfer(int autoTransferId) {
        return depositAutoTransferDAO.deleteAutoTransfer(autoTransferId);
    }
    
    // 자동이체 실행
    @Transactional
    public void executeAutoTransfer(DepositAutoTransferDTO autoTransfer) {
        // 출금계좌 확인
        DepositAccountDTO fromAccount = depositAccountDAO.findAccountById(autoTransfer.getDatId());
        if (fromAccount == null) {
            throw new RuntimeException("출금계좌가 존재하지 않습니다.");
        }
        
        // 잔액 확인
        if (fromAccount.getBalance().compareTo(autoTransfer.getAmount()) < 0) {
            throw new RuntimeException("잔액이 부족합니다.");
        }
        
        // 출금 처리
        DepositTransactionDTO transaction = new DepositTransactionDTO();
        transaction.setDatId(autoTransfer.getDatId());
        transaction.setTransactionType("출금");
        transaction.setAmount(autoTransfer.getAmount());
        transaction.setDescription("자동이체 출금");
        transaction.setTransactionDate(new Date());
        
        // 잔액 업데이트
        BigDecimal newBalance = fromAccount.getBalance().subtract(autoTransfer.getAmount());
        depositTransactionDAO.updateAccountBalance(autoTransfer.getDatId(), newBalance);
        
        // 거래내역 생성
        transaction.setBalance(newBalance);
        depositTransactionDAO.createTransaction(transaction);
    }
    
    // 자동이체 상태 변경
    @Transactional
    public int updateAutoTransferStatus(int autoTransferId, String status) {
        return depositAutoTransferDAO.updateAutoTransferStatus(autoTransferId, status);
    }

    /**
     * 매일 실행되는 자동이체를 처리합니다.
     * - 당일 실행 예정인 자동이체를 조회하여 처리합니다.
     */
    @Transactional
    public void processDailyAutoTransfers() {
        LocalDate today = LocalDate.now();
        List<DepositAutoTransferDTO> dailyTransfers = depositAutoTransferDAO.findByExecutionDate(today);
        
        for (DepositAutoTransferDTO transfer : dailyTransfers) {
            try {
                executeAutoTransfer(transfer);
            } catch (Exception e) {
                // 실패한 이체는 로그를 남기고 다음 이체를 처리
                updateAutoTransferStatus(transfer.getAutoTransferId(), "FAILED");
            }
        }
    }

    /**
     * 매월 실행되는 자동이체를 처리합니다.
     * - 월 단위로 실행되는 자동이체를 조회하여 처리합니다.
     */
    @Transactional
    public void processMonthlyAutoTransfers() {
        LocalDate today = LocalDate.now();
        List<DepositAutoTransferDTO> monthlyTransfers = depositAutoTransferDAO.findByMonthlyExecutionDate(today.getDayOfMonth());
        
        for (DepositAutoTransferDTO transfer : monthlyTransfers) {
            try {
                executeAutoTransfer(transfer);
            } catch (Exception e) {
                // 실패한 이체는 로그를 남기고 다음 이체를 처리
                updateAutoTransferStatus(transfer.getAutoTransferId(), "FAILED");
            }
        }
    }

    /**
     * 실패한 자동이체를 재시도합니다.
     * - 상태가 FAILED인 자동이체를 조회하여 재시도합니다.
     */
    @Transactional
    public void retryFailedAutoTransfers() {
        List<DepositAutoTransferDTO> failedTransfers = depositAutoTransferDAO.findByStatus("FAILED");
        
        for (DepositAutoTransferDTO transfer : failedTransfers) {
            try {
                executeAutoTransfer(transfer);
            } catch (Exception e) {
                // 재시도 실패 시 상태를 PERMANENT_FAILED로 변경
                updateAutoTransferStatus(transfer.getAutoTransferId(), "PERMANENT_FAILED");
            }
        }
    }
} 