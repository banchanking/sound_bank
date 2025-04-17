package com.boot.sound.sms.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.boot.sound.sms.dto.SmsRequest;
import com.boot.sound.sms.service.SmsService;

@RestController
@RequestMapping("/api/sms")
public class SmsController {

    private final SmsService smsService;

    public SmsController(SmsService smsService) {
        this.smsService = smsService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> sendSms(@RequestBody SmsRequest smsRequest) {
       
        boolean result = smsService.sendVerificationSms(smsRequest);
        if (result) {
            return ResponseEntity.ok("SMS sent successfully using CoolSMS SDK.");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Failed to send SMS using CoolSMS SDK.");
        }
    }
    
    @PostMapping("/verify")
    public ResponseEntity<?> requestCode(@RequestBody SmsRequest smsRequest){
    
    	boolean result = smsService.verifyCode(smsRequest);
    	
    	return ResponseEntity.ok(result);
    }
    
    // 회원가입용 (DB에 정보 없기때문에 핸드폰번호만 인증)
    @PostMapping("/signup/request")
    public ResponseEntity<?> signupSendCode(@RequestBody SmsRequest smsRequest) {
        boolean result = smsService.sendSignupVerificationCode(smsRequest.getCustomer_phone_number());
        if (result) return ResponseEntity.ok("Signup SMS sent");
        else return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Signup SMS failed");
    }

    // 회원가입용 (디비에 정보 없기때문에 핸드폰번호만 인증)
    @PostMapping("/signup/verify")
    public ResponseEntity<?> signupVerifyCode(@RequestBody SmsRequest smsRequest) {
        boolean result = smsService.verifyCode(smsRequest);
        return ResponseEntity.ok(result);
    }
    
}
