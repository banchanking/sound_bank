package com.boot.sound.deposit;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.sound.transfer.transAuto.TransAutoDTO;


@RestController
@RequestMapping("/api")
@CrossOrigin
public class DepositController {
	
	@Autowired
	   private DepositService service;
	   

	 // 예금 리스트   
	@GetMapping("/depositList")
	public ResponseEntity<?> getDepositsByCustomerId(@RequestParam String customerId) {
	    try {
	        List<DepositDTO> deposits = service.getDepositsByCustomerId(customerId);
	        return ResponseEntity.ok(deposits); // JSON 형식으로 반환
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("데이터를 가져오는 중 오류가 발생했습니다.");
	    }
	}
	    
	    
	// 신규 예금 추가
	   @PostMapping("/depositInsert")
	   public ResponseEntity<?> depositInsert(@RequestBody DepositDTO dto) {
	       System.out.println("컨트롤러 - depositInsert");
	       String generatedAccountNum = service.depositInsert(dto); // 생성된 계좌번호 반환
	       Map<String, String> response = new HashMap<>();
	       response.put("message", "Deposit successfully inserted");
	       response.put("dat_deposit_account_num", generatedAccountNum); // 생성된 계좌번호 포함
	       return ResponseEntity.ok(response); // HttpStatus.OK(200) 반환
	   }
	   

	// 입출금 처리
	   @PostMapping("/depositWithdrawal")
	   public ResponseEntity<?> handleTransaction(@RequestBody DepositDTO dto) {
	       System.out.println("Received request: " + dto);
	       try {
	           service.processTransaction(dto);
	           return ResponseEntity.ok("거래 성공: " + dto.getDat_deposit_account_num() + " 계좌에 " + dto.getDat_new_amount() + "원이 처리되었습니다.");
	       } catch (IllegalArgumentException e) {
	           System.err.println("Error: " + e.getMessage());
	           return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
	       } catch (Exception e) {
	           e.printStackTrace();
	           return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
	       }
	   }
	   
	    // 자동이체 등록
	    @PostMapping("/autoTransfer")
	    public String add(@RequestBody DepositDTO dto) {
	        // 비밀번호 확인
	        boolean ok = service.checkPassword(dto.getOut_account_number(), dto.getPassword());

	        if (!ok) {
	            return "비밀번호 오류";
	        }

	        // 누락될 수 있는 기본값 보완
	        dto.setTransfer_type("자동");   // 이체 유형 고정
	        dto.setActive_yn("Y");          // 기본 사용 상태

	        service.saveTransAuto(dto);
	        
	        return "자동이체 등록완료";
	    }

}
