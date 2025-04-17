package com.boot.sound.transfer.transLimit;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TransLimitDAO {

    // [회원가입] 한도요청 저장
    public void joinInsertLimit(TransLimitDTO dto);

    // [회원가입] 한도요청 저장 
    public void insertApproval(ApprovalDTO approval);

    // [고객] 기존한도 조회
    public Integer selectLatestApprovedLimit(String customer_id);
    
    // [고객] 요청목록 조회
    public List<TransLimitDTO> getLimitList(String customer_id);

    // [고객] 한도변경 요청등록
    public void insert(TransLimitDTO dto);
    
    // [고객] 중복대기 요청 존재여부
    public boolean  existsPendingRequest(String customer_id, String out_account_number);

    // [고객] 한도변경 요청수정
    public void update(TransLimitDTO dto);

    // [고객] 한도변경 요청삭제
    public void delete(int transfer_id);

    // [관리자] 전체요청 목록
    public List<TransLimitDTO> getAllLimitList();

    // [관리자] 승인
    public void approve(ApprovalDTO admindto);
    
    // transfer_tbl 승인상태 변경
    public void updateTransferStatusApproval(int transfer_id, String status);

    // [관리자] 거절
    public void reject(ApprovalDTO admindto);
    
    // transfer_tbl 거절상태 변경
    public void updateTransferStatusReject(int transfer_id, String status);
}
