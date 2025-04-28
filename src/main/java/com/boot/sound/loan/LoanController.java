package com.boot.sound.loan;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.inquire.account.AccountService;
import com.boot.sound.loan.dto.LateInterestDTO;
import com.boot.sound.loan.dto.LoanApplyWithTermsDTO;
import com.boot.sound.loan.dto.LoanConsentDTO;
import com.boot.sound.loan.dto.LoanDTO;
import com.boot.sound.loan.dto.LoanStatusDTO;
import com.boot.sound.loan.dto.LoanWithTermsDTO;
import com.boot.sound.loan.dto.PrepaymentDTO;
import com.boot.sound.loan.service.LoanAccountService;
import com.boot.sound.loan.service.LoanService;
import com.boot.sound.sms.dto.SmsRequest;
import com.boot.sound.sms.service.SmsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api")
@CrossOrigin
public class LoanController {

	private final LoanService service;
	
	// 대출 상품 리스트 http://localhost:8081/api/loanList
	@GetMapping("/loanList")
	public ResponseEntity<?> loanList(){
		return new ResponseEntity<>(service.loanList(),HttpStatus.OK);
	};
	
	// 대출 상품 등록 및 약관등록 http://localhost:8081/api/loanInsert
	@PostMapping("/loanInsert")
	public ResponseEntity<?> loanInsert(@RequestBody LoanWithTermsDTO dto){
		return new ResponseEntity<>(service.loanInsert(dto),HttpStatus.CREATED);
	};
	
	// 대출 상품 수정
	@PutMapping("/loanUpdate/{loan_id}")
	public ResponseEntity<?> loanUpdate(@PathVariable int loan_id, @RequestBody LoanDTO dto){
		return new ResponseEntity<>(service.loanUpdate(loan_id,dto),HttpStatus.CREATED);
	}
	
	// 대출 상품 삭제 http://localhost:8081/api/loanDelete
	@DeleteMapping("/loanDelete/{loan_id}")
	public ResponseEntity<?> loanDelete(@PathVariable int loan_id){
		return new ResponseEntity<>(service.loanDelete(loan_id),HttpStatus.OK);
	}
	
	// 대출 상품 상세 http://localhost:8081/api/loanDetail/{loan_id}
	@GetMapping("/loanDetail/{loan_id}")
	public ResponseEntity<?> loanDetail(@PathVariable int loan_id){
		return new ResponseEntity<>(service.loanDetail(loan_id),HttpStatus.OK);
	}
	
	
	// 대출 신청전 동의서 동의내역 관리 http://localhost:8081/api/consertInsert
	@PostMapping("/consertInsert")
	public ResponseEntity<?> consentInsert(@RequestBody LoanConsentDTO dto){
		System.out.println(dto);
		return new ResponseEntity<>(service.consentInsert(dto),HttpStatus.CREATED);
	}
	
	// 신청고객및 대출정보 
	@GetMapping("/loanCustomer")
	public ResponseEntity<?> loanCustomer(@RequestParam("customerId") String customerId,
											@RequestParam("loan_id") String loan_id) {
	    
	   
	    return new ResponseEntity<>(service.loanCustomer(customerId,loan_id), HttpStatus.OK);
	}
	
	// 대출신청 정보 저장
	@PostMapping("/loanApply")
	public ResponseEntity<?> loanApply(@RequestBody LoanApplyWithTermsDTO dto) {
	    return new ResponseEntity<>(service.loanApply(dto), HttpStatus.CREATED);
	}
	
	// 대출 현황 리스트
	@GetMapping("/loanStatus")
	public ResponseEntity<?>loanStatus(){
		System.out.println(service.loanStatus());
		return new ResponseEntity<>(service.loanStatus(),HttpStatus.OK);
	}
	
	// 대출 승인or거절 처리
	@PostMapping("/loanStatusUpdate/{loanStatusNo}")
	public ResponseEntity<?> loanStatusUpdate(
	        @PathVariable int loanStatusNo,
	        @RequestBody Map<String, String> data
	) {
	    String loan_progress = data.get("loan_progress");
	    String customerId = data.get("customerId");

	    boolean updated = service.loanStatusUpdate(loanStatusNo, loan_progress, customerId);
	    return updated
	        ? new ResponseEntity<>("대출 상태 변경 처리 완료", HttpStatus.OK)
	        : new ResponseEntity<>("대출 상태 변경 실패", HttpStatus.BAD_REQUEST);
	}

	
	@GetMapping("/myLoanStatus")
	public ResponseEntity<?>myLoanStatus(@RequestParam ("customerId") String customerId){
		return new ResponseEntity<>(service.myLoanStatus(customerId),HttpStatus.OK);
	}
	
	@GetMapping("/selectLoanTerm/{loan_id}")
	public ResponseEntity<?>selectLoanTerm(@PathVariable int loan_id){
		return new ResponseEntity<>(service.selectLoanTerm(loan_id),HttpStatus.OK);
	}
	
	// 중도 상환처리 및 대출상태 변경처리
	@PostMapping("/calculatePrepaymentPenalty")
	public ResponseEntity<?> calculatePrepaymentPenalty(@RequestBody PrepaymentDTO dto) {
	    try {
	        Boolean result = service.calculatePrepaymentPenalty(dto);
	        Map<String, Object> response = new HashMap<>();

	        if (result) {
	            response.put("status", "success");
	            response.put("message", "중도상환 완료");
	            return ResponseEntity.ok(response);
	        } else {
	            response.put("status", "fail");
	            response.put("message", "중도상환 실패");
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	        }
	    } catch (Exception e) {
	        e.printStackTrace();

	        Map<String, Object> errorResponse = new HashMap<>();
	        errorResponse.put("status", "error");
	        errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "서버 내부 오류");

	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
	    }
	}

	
	// 고객별 대출이자 납부내역
	@GetMapping("/myInterestList")
	public ResponseEntity<?>myInterestList(@RequestParam("customerId")String customerId){
		return new ResponseEntity<>(service.myInterestList(customerId),HttpStatus.OK);
	}
	
	// 미납내역 수동입금처리
	@PostMapping("/paymentRequest")
	public ResponseEntity<?> paymentRequest(@RequestBody PrepaymentDTO dto) {
	    boolean success = service.paymentRequest(dto);

	    if (success) {
	        return ResponseEntity.status(HttpStatus.CREATED).body("미납요금이 납부되었습니다.");
	    } else {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("잔액 부족 등으로 납부 실패했습니다.");
	    }
	}
	
	@GetMapping("/myLateInterest")
	public ResponseEntity<?> myLateInterest(@RequestParam String customerId) {
	    return new ResponseEntity<>(service.getLateInterestList(customerId), HttpStatus.OK);
	}
	
	@GetMapping("/admin/loanInterestList")
	public ResponseEntity<?> adminLoanInterestList(){
		return new ResponseEntity<>(service.adminLoanInterestList(),HttpStatus.OK);
	}
	
	@GetMapping("/admin/loanLateInterestList")
	public ResponseEntity<?>adminLoanLateInterestList(){
		return new ResponseEntity<>(service.adminLoanLateInterestList(),HttpStatus.OK);
	}
	
	@GetMapping("/selectCreditScore/{customerId}")
	public ResponseEntity<?> getCreditScore(@PathVariable String customerId) {
		return new ResponseEntity<>(service.selectCreditScore(customerId),HttpStatus.OK);
	}
	
}
