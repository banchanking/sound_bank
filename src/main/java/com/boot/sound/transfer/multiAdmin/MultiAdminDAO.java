package com.boot.sound.transfer.multiAdmin;

import org.apache.ibatis.annotations.Mapper;

import com.boot.sound.inquire.transfer.TransActionDTO;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;


@Mapper
public interface MultiAdminDAO {

    // 요청리스트
    public List<MultiAdminDTO> getApproveList();

    // 요청건 상세 (세부 이체건)
    public List<MultiAdminDTO> getTransferDetails(int transfer_id);

    // 승인 업데이트
    public void updateApprovalStatus(String customer_id, Timestamp request_date, String reason);

    // 승인건 이체시간 업데이트
    public void updateTransferDateNow(String customer_id, Timestamp request_date);

    // 승인된 요청건 세부 이체건 조회
    public List<MultiAdminDTO> findTransfersByGroup(String customer_id, Timestamp request_date);

    // 출금처리
    public void decreaseBalance(String out_account_number, BigDecimal amount);

    // 입금처리
    public void increaseBalance(String in_account_number, BigDecimal amount);

    // 거래내역 저장
    public void insertTransaction(TransActionDTO dto);

    // 반려 업데이트
    public void updateRejectStatus(String customer_id, Timestamp request_date, String reason);
}
