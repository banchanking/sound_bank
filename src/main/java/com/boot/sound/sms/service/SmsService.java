package com.boot.sound.sms.service;

import net.nurigo.sdk.NurigoApp;
import net.nurigo.sdk.message.exception.NurigoMessageNotReceivedException;
import net.nurigo.sdk.message.model.Message;
import net.nurigo.sdk.message.request.SingleMessageSendingRequest;
import net.nurigo.sdk.message.response.SingleMessageSentResponse;
import net.nurigo.sdk.message.service.DefaultMessageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.customer.CustomerRepository;
import com.boot.sound.sms.dto.SmsRequest;

import lombok.RequiredArgsConstructor;

import javax.annotation.PostConstruct;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class SmsService {

    // CoolSMS API 인증 정보 (application.yml 또는 properties에 설정)
    @Value("${coolsms.api.key}")
    private String apiKey;

    @Value("${coolsms.api.secret}")
    private String apiSecret;

    // 발신자 번호 (CoolSMS에 등록된 번호)
    @Value("${coolsms.api.sender}")
    private String senderPhoneNumber;
    
    // API 제공 URL (SDK 초기화 시 필요)
    @Value("${coolsms.api.provider}")
    private String providerUrl;
    
    // Nurigo SDK를 이용한 메시지 서비스
    private DefaultMessageService messageService;
    
    // (예제용) 인증 코드를 임시 저장하는 in-memory 저장소
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();

    private final CustomerRepository customerRepository;
    
    private String formatPhoneNumber(String number) {
        if (number == null) {
            return null;
        }
        // 공백 제거
        number = number.trim();
        // 이미 '-'가 포함되어 있다면 그대로 반환
        if (number.contains("-")) return number;
        // 11자리 전화번호 (예: 01012345678)
        if (number.length() == 11) {
            return number.substring(0, 3) + "-" + number.substring(3, 7) + "-" + number.substring(7);
        }
        // 10자리 전화번호 (예: 0212345678)
        if (number.length() == 10) {
            return number.substring(0, 2) + "-" + number.substring(2, 6) + "-" + number.substring(6);
        }
        // 기본적으로 원본 반환
        return number;
    }
    
   
    @PostConstruct
    public void init() {
        // SDK 초기화: NurigoApp.INSTANCE.initialize() 메서드를 통해 messageService 생성
        // providerUrl은 "https://api.coolsms.co.kr" 형태로 지정됩니다.
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, providerUrl);
    }
    // DB 조회후 문자 메세지 전송 로직 ( 회원정보 일치 확인 // 인증번호 )
    public boolean sendVerificationSms(SmsRequest smsRequest) {
    	String customer_phone_number = smsRequest.getCustomer_phone_number();
    	String customer_name = smsRequest.getCustomer_name();
    	String customer_id = smsRequest.getCustomerId();
    	System.out.println(smsRequest);
    	 Optional<CustomerDTO> customerOpt = customerRepository.findByCustomerPhoneNumberAndCustomerNameAndCustomerId(formatPhoneNumber(customer_phone_number),customer_name,customer_id);
          if (!customerOpt.isPresent()) {
              System.out.println("No customer found with phone number: " + formatPhoneNumber(customer_phone_number));
              return false;
          }
    	
    	String verificationCode = generateVerificationCode();
        verificationCodes.put(customer_phone_number, verificationCode);

        Message message = new Message();
        message.setFrom(senderPhoneNumber);
        message.setTo(customer_phone_number);
        message.setText("[SoundBank]인증번호 [" + verificationCode+"]를 입력해주세요.");

        try {
            SingleMessageSentResponse response = messageService.sendOne(
                    new SingleMessageSendingRequest(message)
            );
            // SMS 발송 시 예외가 발생하지 않았다면 성공으로 간주
            
            return true; 
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // DB 조회후 문자 메세지 전송 로직 ( 회원정보 일치 확인 // 대출결과 전송 ) 
   
    public boolean sendLoanResult(SmsRequest smsRequest) {
    	String customer_phone_number = smsRequest.getCustomer_phone_number();
    	String customer_name = smsRequest.getCustomer_name();
    	String customer_id = smsRequest.getCustomerId();
    	String result = smsRequest.getLoan_progress();
    	
    	 Optional<CustomerDTO> customerOpt = customerRepository.findByCustomerPhoneNumberAndCustomerNameAndCustomerId(formatPhoneNumber(customer_phone_number),customer_name,customer_id);
          if (!customerOpt.isPresent()) {
              System.out.println("No customer found with phone number: " + formatPhoneNumber(customer_phone_number));
              return false;
          }
    	
    	String verificationCode = generateVerificationCode();
        verificationCodes.put(customer_phone_number, verificationCode);
        System.out.println("문자 발송 요청");
        Message message = new Message();
        message.setFrom(senderPhoneNumber);
        message.setTo(customer_phone_number);
        message.setText("[SoundBank] 대출 신청이 " + "["+result+"] 되었습니다." );

        try {
            SingleMessageSentResponse response = messageService.sendOne(
                    new SingleMessageSendingRequest(message)
            );
            // SMS 발송 시 예외가 발생하지 않았다면 성공으로 간주
            
            return true; 
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    // 6자리 난수 생성 
    private String generateVerificationCode() {
        int code = (int)(Math.random() * 900000) + 100000;
        return String.valueOf(code);
    }

    // 필요에 따라 인증 코드 검증 메소드 추가 가능
    public boolean verifyCode(SmsRequest smsRequest) {
        String storedCode = verificationCodes.get(smsRequest.getCustomer_phone_number());
        
        return smsRequest.getCode() != null && smsRequest.getCode().equals(storedCode);
    }
}
