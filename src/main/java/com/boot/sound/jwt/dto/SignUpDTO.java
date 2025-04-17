package com.boot.sound.jwt.dto;

import javax.persistence.Column;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class SignUpDTO {
	
private String customer_id;
    
    
    private String customer_name;
    private char[] customer_password;
    private String customer_resident_number;
    private String customer_address;
    private String customer_phone_number;
    private String customer_email;
    private String customer_job;
    private String customer_account_number;
    private String customer_birthday;
    private String customer_risk_type;
    private String customer_token;
    private String account_pwd;

}
