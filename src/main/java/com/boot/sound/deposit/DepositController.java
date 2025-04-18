package com.boot.sound.deposit;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

//import com.boot.sound.fund.FundDTO;



@RestController
@RequestMapping("/api")
@CrossOrigin
public class DepositController {
	
       @Autowired
       private DepositService service;
       
    
     // 예금 리스트   
   	@GetMapping("/depositList")
   	public ResponseEntity<?> depositList(){
   		System.out.println("depositList()");
   		return new ResponseEntity<>(service.depositList(), HttpStatus.OK);
   		
   	};
		
		
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


}
