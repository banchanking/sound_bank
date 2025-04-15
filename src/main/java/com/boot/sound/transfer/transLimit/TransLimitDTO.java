package com.boot.sound.transfer.transLimit;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class TransLimitDTO {

    // 한도요청 - transfer_tbl
    private int transfer_id;               // PK
    private String customer_id;            // 고객 ID
    private String out_account_number;     // 출금계좌
    private String transfer_type = "한도";  // '한도'
    private int requested_limit;           // 요청한도
    private String reason;                 // 신청 사유
    private Timestamp request_date;        // 신청 일자

    // 관리자 - approval_tbl
    private int approval_id;               // 승인 테이블 PK
    private String approval_type = "한도";  // '한도' 고정
    private String status;                 // 승인 상태: 대기/승인/거절
    private String reject_reason;          // 거절 사유
    private Timestamp approval_date;       // 승인일시
}