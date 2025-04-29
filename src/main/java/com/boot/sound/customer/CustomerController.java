package com.boot.sound.customer;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.boot.sound.admin.service.AdminService;
import com.boot.sound.jwt.config.UserAuthProvider;
import com.boot.sound.jwt.dto.CredentialsDTO;
import com.boot.sound.jwt.dto.SignUpDTO;
import com.boot.sound.jwt.dto.UpdateDTO;
import com.boot.sound.jwt.mappers.CustomerMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
@CrossOrigin
public class CustomerController {


    private final CustomerService service;
     private final UserAuthProvider provider;
     private final CustomerMapper customerMapper;
     private final AdminService adminService;
    
   
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
    public ResponseEntity<?> login(@RequestBody CredentialsDTO dto,  HttpServletResponse response) {
        System.out.println(dto);
        // 로그인한 사용자 정보 가져오기
        CustomerDTO customer = service.login(dto);
        
        if (customer == null) {
            // ✨ 탈퇴 고객 응답
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "signOut user"));
        }
        // Access Token 및 Refresh Token 생성
        String accessToken = provider.createToken(customer.getCustomerId());
        String refresh_token = provider.createRefreshToken(customer.getCustomerId());
        
        // ✅ 쿠키에 refreshToken 심기
        // Cookie refreshTokenCookie = new Cookie("refreshToken", refresh_token);
        // refreshTokenCookie.setHttpOnly(true);
        // refreshTokenCookie.setSecure(false); // HTTPS 환경에서는 true
        // refreshTokenCookie.setPath("/");
        // refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
        
        // response.addCookie(refreshTokenCookie);

        // Refresh Token DB에 저장
        // customerMapper.saveRefreshToken(customer.getCustomerId(), refresh_token);

        

        return ResponseEntity.ok(Map.of(
                "customer_token", accessToken,
                "customerId", customer.getCustomerId(),
                "role","CUSTOMER"
            ));
       
    }
    
    // 회원정보 조회
   @GetMapping("/myInfoList")
   public ResponseEntity<?>myInfoList(@RequestParam String customerId){
	   return new ResponseEntity<>(service.myInfoList(customerId),HttpStatus.OK);
   }
   
   // 회원정보 수정
   @PostMapping("/updateMyInfo")
   public ResponseEntity<?>updateMyInfo(@RequestBody UpdateDTO dto){
	   return new ResponseEntity<>(service.updateMyInfo(dto),HttpStatus.OK);
   }
   //탈퇴전 비밀번호 확인
   @PostMapping("/checkPassword")
   public ResponseEntity<Boolean> checkPassword(@RequestBody CredentialsDTO request) {
       boolean isValid = service.checkPassword(request);
       return new ResponseEntity<>(isValid, HttpStatus.OK);
   }
   
   // 로그아웃
   @PostMapping("/logout")
   public ResponseEntity<?>logout(@RequestBody Map<String, String> request, HttpServletResponse response){

	   String customerId = request.get("customerId");
	   String role = request.get("role");
	   
	   try {
	   provider.deleteRefreshTokenCookie(response);
		   if(role=="CUSTOMER") {
			   service.logout(customerId);
		   }
		   else {
			   adminService.logout(customerId);
		   }
		   return ResponseEntity.ok("로그아웃되었습니다");
	   }catch(Exception e) {
		   e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                             .body("로그아웃 중 오류가 발생했습니다"); 
	   }
   }
   
   // 회원탈퇴
   @PostMapping("/deleteCustomer")
   public ResponseEntity<?> deleteCustomer(@RequestBody Map<String, String> request) {
       String customerId = request.get("customerId");

       try {
           List<String> activeAssets = service.deleteCustomerIfNoAssets(customerId);

           if (!activeAssets.isEmpty()) {
               // 가입된 상품이 존재할 경우
               return ResponseEntity.badRequest().body(activeAssets); // 상품 목록 반환
           }

           // 가입된 상품이 없으면 탈퇴 성공
           return ResponseEntity.ok("회원탈퇴가 완료되었습니다.");
       } catch (Exception e) {
           e.printStackTrace();
           return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("서버 오류로 탈퇴에 실패했습니다.");
       }
   }

    
}