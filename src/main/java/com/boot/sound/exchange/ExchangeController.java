package com.boot.sound.exchange;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.boot.sound.exchange.dto.ExchangeTransactionDTO;
import com.boot.sound.exchange.dto.ExchangeWalletDTO;
import com.boot.sound.inquire.account.AccountDTO;




@RestController
@RequestMapping("/api/exchange")
@CrossOrigin // React 프론트엔드 주소
public class ExchangeController {

    @Autowired
    private ExchangeService service;
      
    // 날짜별 환율 조회 API
    @GetMapping("/rates")
    public ResponseEntity<List<Map<String, Object>>> getExchangeRates(@RequestParam(required = false) String date) {

        System.out.println("<<<< Controller API 요청 환율 조회 >>>>>>");

        if (date == null || date.isEmpty()) {
            date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }

        System.out.println("paramDate : " + date);

        List<Map<String, Object>> rates = service.getExchangeRates(date);
        System.out.println("List = " + rates);

        return ResponseEntity.ok(rates); // 상태 코드 200과 함께 반환
    }
    
    // 날짜별 환율 DB에서 조회
    @GetMapping("/dbRates")
    public ResponseEntity<List<Map<String, Object>>> getDbExchangeRates(@RequestParam(required = false) String date) {

        System.out.println("<<<< Controller DB환율 요청 >>>>>>");

        // 날짜 포맷터 정의
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate requestDate;

        if (date == null || date.isEmpty()) {
            requestDate = LocalDate.now();
            date = requestDate.format(formatter); // 현재 날짜로 설정
        } else {
            requestDate = LocalDate.parse(date, formatter); // 문자열을 LocalDate로 변환
        }

        System.out.println("paramDate : " + date);

        List<Map<String, Object>> rates = service.getDbExchangeRateList(date);
        System.out.println("List = " + rates);

        if(rates == null || rates.isEmpty()) {
            System.out.println("기준일" + date + "의 환율이 없습니다.");
          
            // 하루 전 날짜 계산
            LocalDate previousDate = requestDate.minusDays(1);
            String previousDateStr = previousDate.format(formatter); // 하루 전 날짜를 문자열로 변환
            rates = service.getDbExchangeRateList(previousDateStr); // 하루 전 날짜의 환율 조회
            System.out.println("하루전날짜조회 =" + rates);
          
            if(rates == null || rates.isEmpty()){
                System.out.println("기준일" + date + "의 환율이 없습니다.");
                
                // 이틀 전 날짜 계산
                LocalDate twoDays = requestDate.minusDays(2);
                String twoDaysStr = twoDays.format(formatter); // 이틀 전 날짜를 문자열로 변환
                rates = service.getDbExchangeRateList(twoDaysStr); // 이틀 전 날짜의 환율 조회
                System.out.println("이틀전날짜조회 =" + rates);
                
                if(rates == null || rates.isEmpty()){
                    System.out.println("기준일" + date + "의 환율이 없습니다.");
                    // 3일 전 날짜 계산
                    LocalDate threeDays = requestDate.minusDays(3);
                    String threeDaysStr = threeDays.format(formatter); // 이틀 전 날짜를 문자열로 변환
                    rates = service.getDbExchangeRateList(threeDaysStr); // 이틀 전 날짜의 환율 조회
                    System.out.println("3일전날짜조회 =" + rates);
                }
            }
        } 
       
        return ResponseEntity.ok(rates); // 상태 코드 200과 함께 반환
    }
    
    // 출금 계좌 조회
    @GetMapping("/account/{customer_id}")
    public List<Map<String, Object>> getAccountsByCustomerId(@PathVariable String customer_id) {
        AccountDTO dto = service.findById(customer_id);
        System.out.println(dto);
    
        Map<String, Object> result = new HashMap<>();
        result.put("customer_id", dto.getCustomer_id());
        result.put("account_number", dto.getAccount_number());
        result.put("balance", dto.getBalance());

        return Collections.singletonList(result); // 리스트로 감싸기!
   }
    
    // 환전요청
    @PostMapping("/walletCharge")
    public ResponseEntity<?> handleExchange(@RequestBody ExchangeTransactionDTO dto) {
        if ("buy".equalsIgnoreCase(dto.getTransaction_type())) {
            return ResponseEntity.ok(service.chargeWallet(dto));
        } else if ("sell".equalsIgnoreCase(dto.getTransaction_type())) {
            return ResponseEntity.ok(service.sellForeignCurrency(dto));
        } else {
            return ResponseEntity.badRequest().body("Invalid transaction type");
        }
    }

    // 환전요청 목록
    @GetMapping("/requestList/{customer_id}")
    public ResponseEntity<List<ExchangeTransactionDTO>> requestList(@PathVariable String customer_id) {
        System.out.println("controller - requestList");
        
            return new ResponseEntity<>(service.getRequestList(customer_id), HttpStatus.OK);
    }

    // 관리자 승인/거절
    @PutMapping("/admin/approval")
    public ResponseEntity<?> handleApproval(@RequestBody ExchangeTransactionDTO dto) {

        System.out.println("controller - handleApproval");
        
        try {
        	System.out.println("dto = " + dto.getCustomer_id());
            service.handleApprovalAction(dto);
            return ResponseEntity.ok("거래 처리 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // 환전결과 출력
    @GetMapping("/exchangeList/{customer_id}")
    public ResponseEntity<?> exchangeList(@PathVariable String customer_id){
    	System.out.println("controller - exchangeList");
    	
    	List<ExchangeTransactionDTO> list = service.exchangeList(customer_id);
    	
    	return new ResponseEntity<>(list,HttpStatus.OK);
    }
    
    // my지갑
    @GetMapping("/myWallet/{customer_id}")
    public ResponseEntity<List<ExchangeWalletDTO>> myWallet(@PathVariable String customer_id){
    	System.out.println("controller - myWallet");
    	List<ExchangeWalletDTO> list = service.getWalletsWithAverageRate(customer_id);
    	System.out.println(list);
    	
    	return new ResponseEntity<>(list,HttpStatus.OK);
    }
    
    // 지갑목록 조회
    @GetMapping("/walletList/{customer_id}")
    public ResponseEntity<List<ExchangeWalletDTO>> walletList(@PathVariable String customer_id){
    	
    	List<ExchangeWalletDTO> list = service.findWalletList(customer_id);
    	System.out.println("my wallet list !! =" + list);
    	return ResponseEntity.ok(list);
    }
    
    // 지갑 해지
    @PutMapping("/deactivateWallet/{wallet_id}")
    public ResponseEntity<?> deactivateWallet(@PathVariable Long wallet_id){
    	
    	int result = service.deactivateWallet(wallet_id);
    	System.out.println("result = " + result);
    	
    	return ResponseEntity.ok(result);
    }
           
}
