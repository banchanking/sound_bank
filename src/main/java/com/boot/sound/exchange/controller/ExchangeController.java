package com.boot.sound.exchange.controller;

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
import com.boot.sound.exchange.service.ExchangeService;
import com.boot.sound.inquire.account.AccountDTO;

@RestController
@RequestMapping("/api/exchange")
@CrossOrigin // Origin 에러 방지
public class ExchangeController {

    @Autowired
    private ExchangeService service;
      
    // 날짜별 환율 조회 API
//    @GetMapping("/rates")
//    public ResponseEntity<List<Map<String, Object>>> getExchangeRates(@RequestParam(required = false) String date) {
//
//        System.out.println("<<<< Controller API 요청 환율 조회 >>>>>>");
//
//        if (date == null || date.isEmpty()) {
//            date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")); // 날짜 포맷터
//        }
//
//        System.out.println("paramDate : " + date);
//
//        List<Map<String, Object>> rates = service.getExchangeRates(date); 
//        System.out.println("List = " + rates);
//
//        return ResponseEntity.ok(rates); // 상태 코드 200과 함께 반환
//    }
    
    // 날짜별 환율 DB에서 조회
    @GetMapping("/dbRates")
    public ResponseEntity<Map<String, Object>> getDbExchangeRates(@RequestParam(required = false) String date) {

        System.out.println("<<<< Controller DB환율 요청 >>>>>>");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate requestDate;
        String usedDate = "";
        String alertMsg = null;

        if (date == null || date.isEmpty()) {
            requestDate = LocalDate.now();
            date = requestDate.format(formatter);
        } else {
            requestDate = LocalDate.parse(date, formatter);
        }

        System.out.println("paramDate : " + date);

        List<Map<String, Object>> rates = service.getDbExchangeRateList(date);
        usedDate = date;

        if (rates == null || rates.isEmpty()) {
            for (int i = 1; i <= 3; i++) {
                LocalDate fallbackDate = requestDate.minusDays(i);
                String fallbackDateStr = fallbackDate.format(formatter);
                rates = service.getDbExchangeRateList(fallbackDateStr);
                System.out.println(i + "일 전 날짜 조회 = " + rates);

                if (rates != null && !rates.isEmpty()) {
                    usedDate = fallbackDateStr;
                    alertMsg = "해당 날짜의 환율이 없어 최근일(" + usedDate + ") 기준으로 불러옵니다.";
                    break;
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("rates", rates);
        if (alertMsg != null) result.put("alert", alertMsg);
        return ResponseEntity.ok(result);
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
