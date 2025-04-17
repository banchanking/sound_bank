package com.boot.sound.transfer.transLimit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class TransLimitService {

    @Autowired
    private TransLimitDAO dao;

    // 회원가입시 한도승인
    public void joinLimitApproval(int transfer_id, int limitAmount) {
        ApprovalDTO approval = new ApprovalDTO();
        approval.setTransfer_id(transfer_id);
        approval.setApproval_type("한도");
        approval.setApproval_limit(limitAmount);     // 승인한도 = 요청한도
        approval.setStatus("승인");                  // 회원가입 시 자동 승인
        approval.setApproval_date(new Timestamp(System.currentTimeMillis()));

        dao.insertApproval(approval);
    }
    
    // [고객] 기존한도 조회
    public int getLatestApprovedLimit(String customer_id) {
        Integer result = dao.selectLatestApprovedLimit(customer_id);
        return result != null ? result : 0;
    }
    
    // [고객] 한도 요청 목록 조회 (approval_tbl 조인 포함)
    public List<TransLimitDTO> getListByCustomerId(String customer_id) {
        return dao.getLimitList(customer_id);
    }

    // [고객] 한도 변경 요청 등록
    public boolean insert(TransLimitDTO dto) {
        dto.setTransfer_type("한도"); // 고정값
        dto.setRequest_date(new java.sql.Timestamp(System.currentTimeMillis()));

        // 중복 대기 요청 있는지 확인
        boolean isDuplicate = dao.existsPendingRequest(dto.getCustomer_id(), dto.getOut_account_number());

        if (isDuplicate) {
            return false; // 중복 요청 → 등록 안 함
        }

        dao.insert(dto);
        return true;
    }

    // [고객] 요청 수정
    public void update(TransLimitDTO dto) {
        dao.update(dto);
    }

    // [고객] 요청 삭제
    public void delete(int transfer_id) {
        dao.delete(transfer_id);
    }

    // [관리자] 전체 요청 목록
    public List<TransLimitDTO> getAllList() {
        return dao.getAllLimitList();
    }

    // [관리자] 승인 처리 (approval_limit 저장)
    public void approve(ApprovalDTO admindto) {
        dao.approve(admindto);
        dao.updateTransferStatusApproval(admindto.getTransfer_id(), "승인");
    }

    // [관리자] 거절 처리 (reject_reason 포함)
    public void reject(ApprovalDTO admindto) {
    	ApprovalDTO approval = new ApprovalDTO();
    	approval.setTransfer_id(admindto.getTransfer_id());
    	approval.setApproval_type("한도");
    	approval.setStatus("거절");
    	approval.setReject_reason(admindto.getReject_reason());
    	approval.setApproval_date(new Timestamp(System.currentTimeMillis()));

    	dao.reject(approval);
    	dao.updateTransferStatusReject(admindto.getTransfer_id(), "거절");
    }
}
