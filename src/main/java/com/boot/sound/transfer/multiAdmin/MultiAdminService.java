package com.boot.sound.transfer.multiAdmin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MultiAdminService {

    private final MultiAdminDAO dao;

    public List<MultiAdminDTO> getApproveList() {
        return dao.getApproveList();
    }

    public List<MultiAdminDTO> getTransferDetails(int transfer_id) {
        return dao.getTransferDetails(transfer_id);
    }

    @Transactional
    public void approveMultiGroup(String customer_id, Timestamp request_date) {
        dao.updateApprovalStatusByGroup("승인", null, customer_id, request_date);
        dao.updateTransferDateNow(customer_id, request_date);
        List<MultiAdminDTO> list = dao.findTransfersByGroup(customer_id, request_date);

        for (MultiAdminDTO dto : list) {
            new Thread(() -> {
                try {
                    dao.decreaseBalance(dto.getOut_account_number(), dto.getAmount());
                    dao.increaseBalance(dto.getIn_account_number(), dto.getAmount());

                    // 출금기록 저장
                    dao.insertTransaction(
                        dto.getOut_account_number(),
                        "출금",
                        dto.getAmount(),
                        dto.getMemo(),
                        dto.getCustomer_id(),
                        "입출금"
                    );

                    // 입금기록 저장
                    dao.insertTransaction(
                        dto.getIn_account_number(),
                        "입금",
                        dto.getAmount(),
                        dto.getMemo(),
                        dto.getIn_name(),      
                        "입출금"
                    );

                } catch (Exception e) {
                    System.out.println("이체 스레드 오류: " + e.getMessage());
                }
            }).start();
        }
    }

    @Transactional
    public void rejectGroup(String customer_id, Timestamp request_date, String reason) {
        dao.updateApprovalStatusByGroup("거절", reason, customer_id, request_date);
    }
}