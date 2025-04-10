package com.boot.sound.customer;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

 import com.boot.sound.jwt.config.UserAuthProvider;
import com.boot.sound.jwt.dto.CredentialsDTO;
import com.boot.sound.jwt.dto.SignUpDTO;
import com.boot.sound.jwt.mappers.CustomerMapper;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class CustomerController {

    @Autowired
    private CustomerService service;
     private UserAuthProvider provider;
     private CustomerMapper customerMapper;
    
    public CustomerController(CustomerService service,UserAuthProvider provider,CustomerMapper customerMapper) {
    	super();
    	this.service = service;
    	this.provider = provider;
    	this.customerMapper = customerMapper;
    }

    @GetMapping({"", "/"})
	public String index() {
		System.out.println("<<< index >>>");
		
		return "index";   // 주소 아닌 값을 브라우저에 출력
	}
    
    // 계좌개설
    @PostMapping("/joinAction.do")
    public ResponseEntity<?> registerCustomer(@RequestBody SignUpDTO dto) {
       
    	CustomerDTO customer = service.registerCustomer(dto);
    	
    	return ResponseEntity.created(URI.create("/users/" + customer.getCustomerId()))
				.body(customer);  // 크롬 Network - Headers : 201  Created 반환 
    }

    // ID 중복 확인의 응답을 담기 위한 DTO 클래스
    private static class IdCheckResponse {
        private boolean available; // 아이디 사용 가능 여부
        private String message;    // 아이디 상태에 대한 메시지

        // 생성자: 아이디 사용 가능 여부와 메시지를 전달받아 초기화
        public IdCheckResponse(boolean available, String message) {
            this.available = available;
            this.message = message;
        }

        // getter 메소드들
        public boolean isAvailable() { return available; }
        public String getMessage() { return message; }
    }
    
    // ID 중복확인
    @GetMapping("/idConfirmAction.do")
    public ResponseEntity<?> checkId(@RequestParam String customer_id) {
        // 고객이 요청한 아이디(customer_id)가 이미 사용 중인지 확인하는 서비스 호출
        boolean isDuplicate = service.checkId(customer_id);
        
        // 아이디 사용 가능 여부를 기반으로 응답 메시지를 설정하여 반환
        return ResponseEntity.ok(new IdCheckResponse(!isDuplicate,
                isDuplicate ? "이미 사용중인 아이디입니다" : "사용 가능한 아이디입니다"));
    }

    // 로그인
    @PostMapping("/login.do")
    public ResponseEntity<?> login(@RequestBody CredentialsDTO dto) {
        System.out.println(dto);
        // 로그인한 사용자 정보 가져오기
        CustomerDTO customer = service.login(dto);
        // Access Token 및 Refresh Token 생성
        String accessToken = provider.createToken(customer.getCustomerId());
        String refresh_token = provider.createRefreshToken(customer.getCustomerId());

        // Refresh Token DB에 저장
        customerMapper.saveRefreshToken(customer.getCustomerId(), refresh_token);

        // 클라이언트에게 Access Token, Refresh Token 및 Customer ID 전달
        Map<String, String> response = new HashMap<>();
        response.put("customer_token", accessToken);
        response.put("refresh_token", refresh_token);
        response.put("customerId", customer.getCustomerId()); // Customer ID 추가

        System.out.println(accessToken);
        System.out.println(refresh_token);
        return ResponseEntity.ok(response);
       
    }
    
}