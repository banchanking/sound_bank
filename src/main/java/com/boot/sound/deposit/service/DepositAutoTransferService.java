package com.boot.sound.deposit.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.deposit.dao.DepositAutoTransferDAO;
import com.boot.sound.deposit.dto.DepositAutoTransferDTO;

import java.util.List;

/**
 * DepositAutoTransferService
 * 자동이체 비즈니스 로직 처리 서비스
 */
@Service
@RequiredArgsConstructor
public class DepositAutoTransferService {

    private final DepositAutoTransferDAO autoTransferDAO;
    
    


    /**
     * 자동이체 등록
     * @param transferDTO 등록할 자동이체 정보
     */
    public void registerAutoTransfer(DepositAutoTransferDTO transferDTO) {
        autoTransferDAO.createAutoTransfer(transferDTO);
    }

    /**
     * 고객의 자동이체 리스트 조회
     * @param withdrawAccountNumber 고객 기본계좌 번호
     * @return 자동이체 리스트
     */
    public List<DepositAutoTransferDTO> getCustomerAutoTransfers(String withdrawAccountNumber) {
        return autoTransferDAO.getCustomerAutoTransfers(withdrawAccountNumber);
    }

    /**
     * 자동이체 삭제
     * @param id 자동이체 ID
     */
    public void deleteAutoTransfer(Long id) {
        autoTransferDAO.deleteAutoTransfer(id);
    }

    /**
     * 오늘 실행할 자동이체 처리
     */
    @Transactional
    public void processTodayAutoTransfers() {
        int today = java.time.LocalDate.now().getDayOfMonth();
        List<DepositAutoTransferDTO> autoTransfers = autoTransferDAO.getTodayAutoTransfers(today);

        for (DepositAutoTransferDTO transfer : autoTransfers) {
            // 기본 입출금 계좌 출금
            int withdrawResult = autoTransferDAO.withdrawFromBasicAccount(transfer.getWithdrawAccountNumber(), transfer.getTransferAmount());
            if (withdrawResult == 0) {
                throw new RuntimeException("출금 실패: 계좌 " + transfer.getWithdrawAccountNumber());
            }

            // 입금 대상에 따라 입금 (예금 or 적금)
            if ("DEPOSIT".equals(transfer.getTargetAccountType())) {
                autoTransferDAO.depositToDepositAccount(transfer.getTargetAccountNumber(), transfer.getTransferAmount());
            } else if ("SAVINGS".equals(transfer.getTargetAccountType())) {
                autoTransferDAO.depositToSavingsAccount(transfer.getTargetAccountNumber(), transfer.getTransferAmount());
            } else {
                throw new RuntimeException("알 수 없는 입금 계좌 타입: " + transfer.getTargetAccountType());
            }
        }
    }
}