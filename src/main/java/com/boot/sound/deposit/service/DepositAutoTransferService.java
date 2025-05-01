package com.boot.sound.deposit.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.deposit.dao.DepositAutoTransferDAO;
import com.boot.sound.deposit.dto.DepositAutoTransferDTO;

import java.math.BigDecimal;
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
    
    // 자동이체 수정
    public void updateAutoTransfer(DepositAutoTransferDTO transferDTO) {
        autoTransferDAO.updateAutoTransfer(transferDTO);
    }

    /**
     * 오늘 실행할 자동이체 처리
     */
    @Transactional
    public void processTodayAutoTransfers() {
        int today = java.time.LocalDate.now().getDayOfMonth();
        List<DepositAutoTransferDTO> autoTransfers = autoTransferDAO.getTodayAutoTransfers(today);

        for (DepositAutoTransferDTO transfer : autoTransfers) {
            String fromAccount = transfer.getWithdrawAccountNumber();
            String toAccount = transfer.getTargetAccountNumber();
            BigDecimal amount = transfer.getTransferAmount();
            String type = transfer.getTargetAccountType();

            System.out.println("✅ 자동이체 실행");
            System.out.println("출금계좌: " + fromAccount + ", 입금계좌: " + toAccount + ", 금액: " + amount + ", 타입: " + type);

            // 출금
            int withdrawResult = autoTransferDAO.withdrawFromBasicAccount(fromAccount, amount);
            if (withdrawResult == 0) {
                throw new RuntimeException("출금 실패: 계좌 " + fromAccount);
            }

            // 입금
            if ("DEPOSIT".equals(type)) {
                autoTransferDAO.depositToDepositAccount(toAccount, amount);
            } else if ("SAVINGS".equals(type)) {
                autoTransferDAO.depositToSavingsAccount(toAccount, amount);
            } else {
                throw new RuntimeException("알 수 없는 입금 계좌 타입: " + type);
            }

            // ✅ 메모 설정 (타입별)
            String withdrawMemo = "DEPOSIT".equals(type) ? "예금 자동이체 출금" : "적금 자동이체 출금";
            String depositMemo  = "DEPOSIT".equals(type) ? "예금 자동이체 입금" : "적금 자동이체 입금";

            // ✅ 기본 계좌 거래내역 insert (단일 쿼리 방식)
            autoTransferDAO.insertBasicAccountTransaction(fromAccount, amount.negate(), withdrawMemo);
            autoTransferDAO.insertBasicAccountTransaction(toAccount, amount, depositMemo);

            // ✅ 예금/적금 거래내역 insert
            if ("DEPOSIT".equals(type)) {
                autoTransferDAO.insertDepositTransaction(toAccount, amount, "자동이체 입금");
            } else if ("SAVINGS".equals(type)) {
                autoTransferDAO.insertSavingsTransaction(toAccount, amount, "자동이체 입금");
            }
        }
    }


}
