package com.boot.sound.admin.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.sound.admin.dto.AdminDTO;
import com.boot.sound.admin.dto.AdminRequestDTO;
import com.boot.sound.admin.service.AdminService;
import com.boot.sound.jwt.config.UserAuthProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminController {
	
	private final AdminService adminService;
	private final UserAuthProvider provider;
	
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody AdminRequestDTO request) {
		// 서비스에서 로그인 처리 + 검증 + 관리자 정보 리턴
	    AdminDTO admin = adminService.login(request);

	    // 토큰 발급
	    String token = provider.createAdminToken(admin.getCustomerId());
	    String refreshToken = provider.createRefreshToken(admin.getCustomerId());

	    // refreshToken DB저장
	    adminService.saveAdminRefreshToken(admin.getCustomerId(), refreshToken);

	    Map<String, String> response = new HashMap<>();
	    response.put("admin_token",token);
	    response.put("customerId",admin.getCustomerId());
	    response.put("role",admin.getRole());

	    return ResponseEntity.ok(response);

	}

	@PostMapping("/insert")
	public ResponseEntity<?> insert(@RequestBody AdminDTO dto){
		 try {
			 adminService.insert(dto);
		        return ResponseEntity.ok("등록되었습니다"); 
		    } catch (Exception e) {
		        e.printStackTrace();
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		                             .body("등록 중 오류가 발생했습니다"); 
		    }
	}
	
	@GetMapping("/list")
	public ResponseEntity<?> adminList(){
		return new ResponseEntity<>(adminService.adminList(),HttpStatus.CREATED);
	}
	
	@PostMapping("/update")
	public ResponseEntity<?> update(@RequestBody AdminDTO dto){
		 try {
			 adminService.update(dto);
		        return ResponseEntity.ok("수정되었습니다"); 
		    } catch (Exception e) {
		        e.printStackTrace();
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		                             .body("수정 중 오류가 발생했습니다"); 
		    }
	}
	
	
	@PostMapping("/delete")
	public ResponseEntity<?> delete(@RequestBody  AdminDTO dto){
		 try {
			 adminService.delete(dto);
		        return ResponseEntity.ok("삭제되었습니다"); 
		    } catch (Exception e) {
		        e.printStackTrace();
		        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		                             .body("삭제 중 오류가 발생했습니다"); 
		    }
	}

}
