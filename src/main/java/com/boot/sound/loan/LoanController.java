package com.boot.sound.loan;

import java.math.BigDecimal;
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
import com.boot.sound.loan.dto.LoanApplyWithTermsDTO;
import com.boot.sound.loan.dto.LoanConsentDTO;
import com.boot.sound.loan.dto.LoanDTO;
import com.boot.sound.loan.dto.LoanStatusDTO;
import com.boot.sound.loan.dto.LoanWithTermsDTO;
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

	@Autowired
	private LoanService service;
	
	private final SmsService smsService;
	private final AccountService accountService;
	private final LoanAccountService loanAccountSerive;
	
	// http://localhost:8081/api
	
	// 대출 상품 리스트 http://localhost:8081/api/loanList
	@GetMapping("/loanList")
	public ResponseEntity<?> loanList(){
		System.out.println("loanList()");
		return new ResponseEntity<>(service.loanList(),HttpStatus.OK);
	};
	
	// 대출 상품 등록 및 약관등록 http://localhost:8081/api/loanInsert
	@PostMapping("/loanInsert")
	public ResponseEntity<?> loanInsert(@RequestBody LoanWithTermsDTO dto){
		System.out.println("loanInsert");
		return new ResponseEntity<>(service.loanInsert(dto),HttpStatus.CREATED);
	};
	
	// 대출 상품 수정
	@PutMapping("/loanUpdate/{loan_id}")
	public ResponseEntity<?> loanUpdate(@PathVariable int loan_id, @RequestBody LoanDTO dto){
		System.out.println("loanUpdate");
		return new ResponseEntity<>(service.loanUpdate(loan_id,dto),HttpStatus.CREATED);
	}
	
	// 대출 상품 삭제 http://localhost:8081/api/loanDelete
	@DeleteMapping("/loanDelete/{loan_id}")
	public ResponseEntity<?> loanDelete(@PathVariable int loan_id){
		System.out.println("loanDelete");
		return new ResponseEntity<>(service.loanDelete(loan_id),HttpStatus.OK);
	}
	
	// 대출 상품 상세 http://localhost:8081/api/loanDetail/{loan_id}
	@GetMapping("/loanDetail/{loan_id}")
	public ResponseEntity<?> loanDetail(@PathVariable int loan_id){
		System.out.println("loanDetail");
		return new ResponseEntity<>(service.loanDetail(loan_id),HttpStatus.OK);
	}
	
	// 대출 상품 전체 갯수 http://localhost:8081/api/loanCnt
	@GetMapping("/loanCnt")
	public ResponseEntity<?> loanCnt(){
		System.out.println("컨트롤 - loanCnt()");
		return new ResponseEntity<>(service.loanCnt(),HttpStatus.CREATED);
	}
	
	// 대출 유형 맞춤검사 http://localhost:8081/api/loanTypeSearch/{loan_type}
	@GetMapping("/loanTypeSearch/")
	public ResponseEntity<?> loanTypeSearch(@RequestParam("loan_type") String loan_type){
		System.out.println("컨트롤 - loanTypeSearch()");
		return new ResponseEntity<>(service.loanTypeSearch(loan_type),HttpStatus.CREATED);
	}
	
	// 대출 유형 맞춤검사 http://localhost:8081/api/loanTypeCnt/{loan_type}
	@GetMapping("/loanTypeCnt/")
	public ResponseEntity<?> loanTypeCnt(@RequestParam("loan_type") String loan_type){
		System.out.println("컨트롤 - loanTypeCnt()");
		return new ResponseEntity<>(service.loanTypeCnt(loan_type),HttpStatus.CREATED);
	}
	
	// 대출이름검색 http://localhost:8081/api/loanNameSearch/{loan_type}
	@GetMapping("/loanNameSearch/")
	public ResponseEntity<?> loanNameSearch(@RequestParam("loan_name") String loan_name){
		System.out.println("컨트롤 - loanNameSearch()");
		return new ResponseEntity<>(service.loanNameSearch(loan_name),HttpStatus.CREATED);
	}
	
	// 대출이름 검색 결과 카운트 http://localhost:8081/api/loanNameCnt/{loan_type}
	@GetMapping("/loanNameCnt/")
	public ResponseEntity<?> loanNameCnt(@RequestParam("loan_name") String loan_name){
		System.out.println("컨트롤 - loanNameCnt()");
		return new ResponseEntity<>(service.loanNameCnt(loan_name),HttpStatus.CREATED);
	}
	
	// 대출 신청전 동의서 동의내역 관리 http://localhost:8081/api/consertInsert
	@PostMapping("/consertInsert")
	public ResponseEntity<?> consentInsert(@RequestBody LoanConsentDTO dto){
		System.out.println(dto);
		System.out.println("컨트롤 - consentInsert()");
		return new ResponseEntity<>(service.consentInsert(dto),HttpStatus.CREATED);
	}
	
	// 신청고객및 대출정보 
	@GetMapping("/loanCustomer")
	public ResponseEntity<?> loanCustomer(@RequestParam("customerId") String customerId,
											@RequestParam("loan_id") String loan_id) {
	    System.out.println("컨트롤 - loanCustomer()");
	    
	   
	    return new ResponseEntity<>(service.loanCustomer(customerId,loan_id), HttpStatus.OK);
	}
	
	// 대출신청 정보 저장
	@PostMapping("/loanApply")
	public ResponseEntity<?> loanApply(@RequestBody LoanApplyWithTermsDTO dto) {
	    System.out.println("컨트롤 - loanApply()");
	    return new ResponseEntity<>(service.loanApply(dto), HttpStatus.CREATED);
	}
	
	// 대출 현황 리스트
	@GetMapping("/loanStatus")
	public ResponseEntity<?>loanStatus(){
		System.out.println("컨트롤 - loanStatus()");
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

	    boolean updated = service.loanStatusUpdate(loanStatusNo, loan_progress);
	    System.out.println(updated);

	    if (updated) {
	        // ✅ 승인된 경우에만 계좌에 대출금 입금
	        if ("승인".equals(loan_progress)) {
	        	System.out.println("승인처리");
	            LoanStatusDTO loan = service.selectLoanByNo(loanStatusNo); // 대출 상세 조회
	            System.out.println("loan >>"+loan);
	            if (loan != null && loan.getBalance().compareTo(new BigDecimal(loan.getLoanAmount())) == 0) {
	            	System.out.println("조건문통과");
	                BigDecimal amount = new BigDecimal(loan.getLoanAmount());
	                String acc = loan.getAccountNumber();
	                accountService.deposit(acc, amount); // 입금
	                loan.setBalance(amount); // 잔액 업데이트
	                service.saveLoan(loan);  // 저장
	                String customerName = service.selectCustomerName(customerId);
	                // 계좌 거래 내역 저장
	                loanAccountSerive.saveLoanTransaction(
	                		acc, "입금", amount, "KRW", "대출금 입금", customerName, "입출금");
	                log.info("✅ 대출 승인과 동시에 입금 처리 완료 - 계좌: {}, 금액: {}", acc, amount);
	            }
	        }

	        // 문자 발송 로직
	        CustomerDTO customer = service.selecCustomer(customerId);
	        if (customer != null) {
	            SmsRequest smsRequest = new SmsRequest();
	            smsRequest.setCustomer_phone_number(customer.getCustomerPhoneNumber());
	            smsRequest.setCustomer_name(customer.getCustomer_name());
	            smsRequest.setCustomerId(customerId);
	            smsRequest.setLoan_progress(loan_progress);
	            boolean smsSent = smsService.sendLoanResult(smsRequest);

	            if (smsSent) {
	                return new ResponseEntity<>("대출 상태 변경 및 문자 발송 성공", HttpStatus.OK);
	            } else {
	                return new ResponseEntity<>("대출 상태는 변경되었지만 문자 발송 실패", HttpStatus.OK);
	            }
	        } else {
	            return new ResponseEntity<>("대출 상태는 변경되었지만 고객 정보 없음", HttpStatus.OK);
	        }

	    } else {
	        return new ResponseEntity<>("대출 상태 변경 실패", HttpStatus.BAD_REQUEST);
	    }
	}
	
	@GetMapping("/myLoanStatus")
	public ResponseEntity<?>myLoanStatus(@RequestParam ("customerId") String customerId){
		System.out.println("컨트롤 - myLoanStatus()");
		return new ResponseEntity<>(service.myLoanStatus(customerId),HttpStatus.OK);
	}
	
	@GetMapping("/selectLoanTerm/{loan_id}")
	public ResponseEntity<?>selectLoanTerm(@PathVariable int loan_id){
		System.out.println("컨트롤 - selectLoanTerm()");
		return new ResponseEntity<>(service.selectLoanTerm(loan_id),HttpStatus.OK);
	}
	
	
}
