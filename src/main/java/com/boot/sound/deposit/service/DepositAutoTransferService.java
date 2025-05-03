package com.boot.sound.deposit.service;


import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;
    


    /**
     * 자동이체 등록
     * @param transferDTO 등록할 자동이체 정보
     */
    public void registerAutoTransfer(DepositAutoTransferDTO transferDTO) {
        String encryptedPassword = autoTransferDAO.getAccountPassword(transferDTO.getWithdrawAccountNumber());
        
        System.out.println("🔐 registerAutoTransfer - 계좌번호: " + transferDTO.getWithdrawAccountNumber());
        System.out.println("🔎 DB에서 조회된 암호화 비밀번호: " + encryptedPassword);

        // 비밀번호 존재 여부 체크
        if (encryptedPassword == null || encryptedPassword.isBlank()) {
            throw new RuntimeException("출금 계좌 비밀번호를 찾을 수 없습니다.");
        }

        // 암호 일치 여부 확인
        if (!passwordEncoder.matches(transferDTO.getAccountPassword(), encryptedPassword)) {
            throw new RuntimeException("출금 계좌 비밀번호가 일치하지 않습니다.");
        }

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

    
    // 오늘 실행할 자동이체 처리
    @Transactional
    public void processTodayAutoTransfers() {
        int today = java.time.LocalDate.now().getDayOfMonth();
        List<DepositAutoTransferDTO> autoTransfers = autoTransferDAO.getTodayAutoTransfers(today);

        for (DepositAutoTransferDTO transfer : autoTransfers) {
            String fromAccount = transfer.getWithdrawAccountNumber();
            String toAccount = transfer.getTargetAccountNumber();
            BigDecimal amount = transfer.getTransferAmount();
            String type = transfer.getTargetAccountType();

            System.out.println("자동이체 실행");
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

            //  메모 설정 (타입별)
            String withdrawMemo = "DEPOSIT".equals(type) ? "예금 자동이체 출금" : "적금 자동이체 출금";
            String depositMemo  = "DEPOSIT".equals(type) ? "예금 자동이체 입금" : "적금 자동이체 입금";

            //  기본 계좌 거래내역 insert (단일 쿼리 방식)
            autoTransferDAO.insertBasicAccountTransaction(fromAccount, amount.negate(), withdrawMemo);
            autoTransferDAO.insertBasicAccountTransaction(toAccount, amount, depositMemo);

            //  예금/적금 거래내역 insert
            if ("DEPOSIT".equals(type)) {
                autoTransferDAO.insertDepositTransaction(toAccount, amount, "자동이체 입금");
            } else if ("SAVINGS".equals(type)) {
                autoTransferDAO.insertSavingsTransaction(toAccount, amount, "자동이체 입금");
            }
        }
    }


}
