package com.boot.sound.customer;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.boot.sound.inquire.account.AccountDAO;
import com.boot.sound.inquire.account.AccountDTO;
import com.boot.sound.jwt.dto.CredentialsDTO;
import com.boot.sound.jwt.dto.SignUpDTO;
import com.boot.sound.jwt.exception.AppException;
import com.boot.sound.jwt.mappers.CustomerMapper;

import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.nio.CharBuffer; 


@RequiredArgsConstructor
@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final PasswordEncoder encoder;
     
    @Autowired
    private AccountDAO accountDAO;
    
    public boolean checkId(String customer_id) {
    	return customerRepository.existsById(customer_id);  
    	}

    // 계좌개설
    public CustomerDTO registerCustomer(SignUpDTO signUp) {
    	// 고객 계좌번호를 현재 시간(밀리초)으로 자동생성  => (향후 UUID 방식으롱 개선고려 - 안전성 향상)
    	String millis = String.valueOf(System.currentTimeMillis());

    	// 계좌번호 자르기
    	String part1 = millis.substring(0, 3);      
    	String part2 = millis.substring(3, 9);      
    	String part3 = millis.substring(9);         

    	String accountNumber = part1 + "-" + part2 + "-" + part3;

    	signUp.setCustomer_account_number(accountNumber);
    	
    	
    	
        
        // 고객정보 데이터베이스에 저장
    	CustomerDTO dto = new CustomerDTO();
        dto.setCustomerId(signUp.getCustomer_id());
        dto.setCustomerName(signUp.getCustomer_name());
        dto.setCustomer_resident_number(signUp.getCustomer_resident_number());
        dto.setCustomer_address(signUp.getCustomer_address());
        dto.setCustomerPhoneNumber(signUp.getCustomer_phone_number());
        dto.setCustomer_email(signUp.getCustomer_email());
        dto.setCustomer_job(signUp.getCustomer_job());
        dto.setCustomer_account_number(signUp.getCustomer_account_number());
        dto.setCustomer_birthday(signUp.getCustomer_birthday());
        dto.setCustomer_risk_type(signUp.getCustomer_risk_type());
        dto.setCustomer_token(signUp.getCustomer_token());
        
        dto.setCustomer_password(encoder.encode(CharBuffer.wrap(signUp.getCustomer_password())));
        
        CustomerDTO saveCustomer = customerRepository.save(dto);
        
        // 2. 입출금 계좌 자동 생성
        AccountDTO account = new AccountDTO();
        account.setAccount_number(accountNumber);
        account.setCustomer_id(dto.getCustomerId());
        account.setAccount_type("입출금");
        account.setBalance(BigDecimal.valueOf(0));
        account.setInterest_rate(BigDecimal.valueOf(0.0));
        account.setYield_rate(BigDecimal.valueOf(0.0));
        account.setCurrency_type("KRW");
        account.setAccount_name("기본 입출금 계좌");
        account.setOpen_date(new java.util.Date());

        accountDAO.insertAccount(account); // 계좌 저장
        
        return saveCustomer;
    }
    
    // 로그인
    public CustomerDTO login(CredentialsDTO dto) {
    		System.out.println("<<< CustomerService - login() >>>");
    		
		CustomerDTO user = customerRepository.findById(dto.getCustomerId())
				.orElseThrow(() -> new AppException("UnKnown user", HttpStatus.NOT_FOUND));
		
		// import java.nio.CharBuffer; // 주의
		if(encoder.matches(CharBuffer.wrap(dto.getCustomer_password()), user.getCustomer_password())) {
			return user;
		}
		
		
		throw new AppException("Invalid password", HttpStatus.BAD_REQUEST);
	}
    
    // 사용자 토큰 검증
    public CustomerDTO findById(String customerId) {
	System.out.println("<<< UserService - findById() >>>");

	CustomerDTO user = customerRepository.findById(customerId)
			.orElseThrow(() -> new AppException("Unknown customer", HttpStatus.NOT_FOUND));
	return customerMapper.toCustomerDTO(user);
	}
    
}