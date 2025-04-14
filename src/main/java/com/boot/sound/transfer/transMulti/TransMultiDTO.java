package com.boot.sound.transfer.transMulti;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class TransMultiDTO {

    private String customer_id;             // 고객 번호
    private String out_account_number;      // 출금 계좌번호
    private String password;                // 출금 계좌 비밀번호
    private String memo;                    // 출금 메모
    @Temporal(TemporalType.TIMESTAMP)
    private Date request_date;			    // 요청날짜

    @JsonProperty("transfers") 				// 프론트 JSON 키와 매핑
    private List<InList> inList;            // 입금 정보 목록

    @Data
    public static class InList {
        private String in_account_number;   // 입금 계좌번호
        private BigDecimal amount;          // 이체 금액
        private String in_name;             // 수취인 이름
        private String memo;                // 입금 메모
        
        private String status;				// 승인상태 (승인/대기/거절)
        private String reject_reason;		// 거절사유
        private String approval_type;		// 승인유형 (다건이체/한도심사)
        
        @Temporal(TemporalType.TIMESTAMP)
        private Date approval_date;			// 승인날짜
    }
}