package com.boot.sound.jwt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateDTO {

    private String customerId;            // 아이디
    private String customerPassword;		// 비밀번호
    private String customerName;          // 이름
    private String customer_email;        // 이메일
    private String customerPhoneNumber;   // 전화번호
    private String customer_resident_number; // 주민등록번호
    private String customer_address;      // 주소
    private String customer_account_number; // 대표계좌번호
    private String customer_job;          // 직업
    private String customer_risk_type;    // 투자성향

}
