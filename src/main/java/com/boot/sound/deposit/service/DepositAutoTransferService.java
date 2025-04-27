package com.boot.sound.deposit.service;

import com.boot.sound.deposit.dao.DepositAutoTransferDAO;
import com.boot.sound.deposit.dto.DepositAutoTransferDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepositAutoTransferService {

    private final DepositAutoTransferDAO depositAutoTransferDAO;

    // 자동이체 등록
    @Transactional
    public void createAutoTransfer(DepositAutoTransferDTO dto) {
        int result = depositAutoTransferDAO.insertAutoTransfer(dto);
        if (result != 1) {
            throw new RuntimeException("자동이체 등록에 실패했습니다.");
        }
    }

    // 고객별 자동이체 조회
    @Transactional(readOnly = true)
    public List<DepositAutoTransferDTO> getAutoTransfersByCustomerId(String customerId) {
        return depositAutoTransferDAO.getAutoTransfersByCustomerId(customerId);
    }

    // 자동이체 해지 (삭제)
    @Transactional
    public void deleteAutoTransfer(int autoTransferId) {
        int result = depositAutoTransferDAO.deleteAutoTransfer(autoTransferId);
        if (result != 1) {
            throw new RuntimeException("자동이체 해지에 실패했습니다.");
        }
    }
}
