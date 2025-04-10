package com.boot.sound.sms.dto;

import lombok.Data;

@Data
public class SmsRequest {
    private String customer_phone_number;
    private String code;
    private String customer_name;
    private String customerId;
    private String loan_progress;
    private int loan_status_no;
    
}
