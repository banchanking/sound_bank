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
import com.boot.sound.jwt.config.EncryptionUtils;
import com.boot.sound.sms.dto.SmsRequest;

import lombok.RequiredArgsConstructor;

import javax.annotation.PostConstruct;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class SmsService {

    @Value("${coolsms.api.key}")
    private String apiKey;

    @Value("${coolsms.api.secret}")
    private String apiSecret;

    @Value("${coolsms.api.sender}")
    private String senderPhoneNumber;

    @Value("${coolsms.api.provider}")
    private String providerUrl;

    private DefaultMessageService messageService;

    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();

    private final CustomerRepository customerRepository;

    private String formatPhoneNumber(String number) {
        if (number == null) {
            return null;
        }
        number = number.trim();
        if (number.contains("-")) return number;
        if (number.length() == 11) {
            return number.substring(0, 3) + "-" + number.substring(3, 7) + "-" + number.substring(7);
        }
        if (number.length() == 10) {
            return number.substring(0, 2) + "-" + number.substring(2, 6) + "-" + number.substring(6);
        }
        return number;
    }

    @PostConstruct
    public void init() {
        this.messageService = NurigoApp.INSTANCE.initialize(apiKey, apiSecret, providerUrl);
    }

    public boolean sendVerificationSms(SmsRequest smsRequest) {
        String customer_phone_number = smsRequest.getCustomer_phone_number();
        String customer_name = smsRequest.getCustomer_name();
        String customer_id = smsRequest.getCustomerId();
        System.out.println(smsRequest);

        // ✅ 암호화된 전화번호로 검색
        String encryptedPhone = EncryptionUtils.encrypt(formatPhoneNumber(customer_phone_number));
        System.out.println(encryptedPhone);

        Optional<CustomerDTO> customerOpt = customerRepository.findByCustomerPhoneNumberAndCustomerNameAndCustomerId(
            encryptedPhone, customer_name, customer_id);

        if (!customerOpt.isPresent()) {
            System.out.println("No customer found with phone number: " + formatPhoneNumber(customer_phone_number));
            return false;
        }

        String verificationCode = generateVerificationCode();
        verificationCodes.put(customer_phone_number, verificationCode);

        Message message = new Message();
        message.setFrom(senderPhoneNumber);
        message.setTo(customer_phone_number);
        message.setText("[SoundBank]인증번호 [" + verificationCode + "]를 입력해주세요.");

        try {
            SingleMessageSentResponse response = messageService.sendOne(
                new SingleMessageSendingRequest(message)
            );
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean sendLoanResult(SmsRequest smsRequest) {
        String customer_phone_number = smsRequest.getCustomer_phone_number();
        String customer_name = smsRequest.getCustomer_name();
        String customer_id = smsRequest.getCustomerId();
        String result = smsRequest.getLoan_progress();


        Optional<CustomerDTO> customerOpt = customerRepository.findByCustomerPhoneNumberAndCustomerNameAndCustomerId(
        		customer_phone_number, customer_name, customer_id);

        // 고객이 없으면 종료
        if (!customerOpt.isPresent()) {
            System.out.println("No customer found with phone number: " + formatPhoneNumber(customer_phone_number));
            return false;
        }

        // ✅ 복호화된 전화번호를 문자 전송용으로 사용
        String decryptedPhone = EncryptionUtils.decrypt(customerOpt.get().getCustomerPhoneNumber());

        String verificationCode = generateVerificationCode();
        verificationCodes.put(decryptedPhone, verificationCode);
        System.out.println("문자 발송 요청");

        Message message = new Message();
        message.setFrom(senderPhoneNumber);
        message.setTo(decryptedPhone); // 복호화된 전화번호로 전송
        message.setText("[SoundBank] 대출 신청이 [" + result + "] 되었습니다.");

        try {
            SingleMessageSentResponse response = messageService.sendOne(
                new SingleMessageSendingRequest(message)
            );
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    public boolean sendSignupVerificationCode(String phoneNumber) {
    	String normalizedPhone = phoneNumber.replaceAll("-", "");
        String verificationCode = generateVerificationCode();
        verificationCodes.put(normalizedPhone, verificationCode);

        Message message = new Message();
        message.setFrom(senderPhoneNumber);
        message.setTo(phoneNumber);
        message.setText("[SoundBank] 인증번호 [" + verificationCode + "]를 입력해주세요.");

        try {
            messageService.sendOne(new SingleMessageSendingRequest(message));
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private String generateVerificationCode() {
        int code = (int)(Math.random() * 900000) + 100000;
        return String.valueOf(code);
    }

    public boolean verifyCode(SmsRequest smsRequest) {
        String phone = smsRequest.getCustomer_phone_number();
        String storedCode = verificationCodes.get(phone);
        System.out.println("인증 요청 받은 전화번호: " + phone);
        System.out.println("저장된 코드 (storedCode): " + storedCode);
        System.out.println("입력한 인증번호 (smsRequest.getCode()): " + smsRequest.getCode());
        if (storedCode == null && phone.contains("-")) {
            String normalizedPhone = phone.replaceAll("-", "");
            storedCode = verificationCodes.get(normalizedPhone);
            if (storedCode != null) {
                phone = normalizedPhone;
            }
        }

        boolean result = smsRequest.getCode() != null && smsRequest.getCode().equals(storedCode);
        System.out.println("인증결과 : "+result);

        if (result) {
            verificationCodes.remove(phone);
        }

        return result;
    }
}
