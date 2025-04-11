package com.boot.sound.exchange;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.boot.sound.exchange.api.ExchangeRateApiClient;
import com.boot.sound.inquire.account.AccountDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ExchangeService {

    @Value("${api-key}")
    private String apikey;
    public String getApiKey() {
       return apikey;
    }
    
    // 리디렉션 처리 가능한 HttpClient 설정
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ExchangeDAO dao;
    private final ExchangeRateApiClient apiClient;
    
    public ExchangeService(ExchangeDAO dao, ExchangeRateApiClient apiClient) {
    	
    	this.dao = dao;
    	this.apiClient = apiClient;
    	HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
    	factory.setHttpClient(HttpClients.custom().disableRedirectHandling().build());
        this.restTemplate = new RestTemplate(factory);		
    }

    // 환율 리스트
    public List<Map<String, Object>> getExchangeRates(String date) {
        try {
            if (date == null || date.isEmpty()) {
                date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            } else if (date.contains("-")) {
                date = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
                        .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            }

            String url = "https://www.koreaexim.go.kr/site/program/financial/exchangeJSON"
                    + "?authkey=" + apikey
                    + "&searchdate=" + date
                    + "&data=AP01";

            System.out.println("요청 URL: " + url);

            // 재시도 로직 적용
            String response = fetchWithRetry(url, 3, 1000);
            return objectMapper.readValue(response, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("환율 정보 조회 중 오류 발생", e);
        }
    }
    
    // 재요청 메서드
    private String fetchWithRetry(String url, int maxRetries, long delayMs) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) { // 
            try {
                String response = restTemplate.getForObject(url, String.class);
                if (response != null && !response.isEmpty()) {
                    return response;
                }
                System.err.println("응답이 비어있음. 재시도 중... (" + attempt + "/" + maxRetries + ")");
                Thread.sleep(delayMs);
            } catch (Exception e) {
                System.err.println("예외 발생. 재시도 중... (" + attempt + "/" + maxRetries + ")");
                e.printStackTrace();
                try {
                    Thread.sleep(delayMs);
                } catch (InterruptedException ignored) {}
            }
        }
        throw new RuntimeException("환율 정보 요청 재시도 실패");
    }    
    
    // 고객 계좌 조회
    @Transactional(readOnly = true)
    public AccountDTO findById(String customer_id){

        System.out.println("service - findById");

        return dao.findAccountById(customer_id);
    }

    // 지갑 존재여부 확인 (1)
    private void handleWalletTransaction(String customerId, String currencyCode, BigDecimal exchangedAmount, BigDecimal exchangeRate) {
        int exists = dao.findByCustomerAndCurrency(customerId, currencyCode);
        System.out.println("지갑 존재 여부: " + exists);

        if (exists == 1) {
            // 외환지갑 있으면 외환지갑 잔액만 update 
        	System.out.println("지갑이 있다. 업데이트 간다.");
        	ExchangeWalletDTO wallet = dao.findWalletByCustomerAndCurrency(customerId, currencyCode);

            wallet.setBalance(wallet.getBalance().add(exchangedAmount));
            dao.updateWalletBalance(wallet);
       
        } else { // 외환지갑 없을시에는 새로 등록
        	System.out.println("지갑이 없다. 새지갑으로 간다.");
            ExchangeWalletDTO newWallet = new ExchangeWalletDTO();
            newWallet.setCustomer_id(customerId);
            newWallet.setCurrency_code(currencyCode);
            newWallet.setBalance(exchangedAmount);
            newWallet.setStatus("ACTIVE");
            dao.insertWallet(newWallet);
        }
    }
    
    // 지갑 충전,기록저장 / 지갑이 존재하지 않을 시 자동으로 지갑 생성,기록저장 (2)
    @Transactional
    public ExchangeTransactionDTO chargeWallet(ExchangeTransactionDTO dto) {
        String customerId = dto.getCustomer_id();
        String currencyCode = dto.getCurrency_code();
        String to_currency = dto.getTo_currency();
        String from_currency = dto.getFrom_currency();
        BigDecimal requestAmount = dto.getRequest_amount();
        BigDecimal exchangedAmount = dto.getExchanged_amount();
        BigDecimal exchangeRate = dto.getExchange_rate();
        
        // 승인 조건 체크
        if ("buy".equals(dto.getTransaction_type()) && requestAmount.compareTo(new BigDecimal("1000000")) >= 0) {
            dto.setApproval_status("PENDING");
        } else {
            dto.setApproval_status("APPROVED");
        }

        System.out.println(customerId +" "+ currencyCode+" "+ requestAmount+" "+ exchangedAmount 
        + " "+ to_currency + " "+ from_currency + dto.getApproval_status());

        AccountDTO account = validateAndFetchAccount(dto.getWithdraw_account_number(), requestAmount);
        
        // 승인 상태가 APPROVED일 때만 출금과 지갑 충전 처리
        if ("APPROVED".equals(dto.getApproval_status())) {
            dao.updateAccountBalance(account);
            handleWalletTransaction(customerId, currencyCode, exchangedAmount, exchangeRate);
        }

        if (dao.chargeWallet(dto) <= 0) {
            throw new RuntimeException("환전 거래 등록 실패");
        }

        return dao.findTransById(customerId);
    }
    
    // 계좌에서 돈 출금 (3)
    private AccountDTO validateAndFetchAccount(String accountNumber, BigDecimal requestAmount) {
        
    	AccountDTO account = dao.findAccountByNumber(accountNumber);
        
    	//계좌 없으면
    	if (account == null) {
            throw new RuntimeException("출금 계좌를 찾을 수 없습니다.");
        }
    	// 잔액 부족시 
        if (account.getBalance().compareTo(requestAmount) < 0) {
            throw new RuntimeException("계좌 잔액이 부족합니다.");
        }
        // 통장에서 환전신청한 금액만큼 뺀다
        account.setBalance(account.getBalance().subtract(requestAmount));
        return account;
    }    

    // 관리자 승인처리
    @Transactional
    public void handleApprovalAction(ExchangeTransactionDTO dto) {

        String customer_id = dto.getCustomer_id(); // 고객 ID
        Long exchange_transaction_id = dto.getExchange_transaction_id(); // 거래 ID
        String approval_status = dto.getApproval_status(); // "APPROVED" or "REJECTED"
        System.out.println(exchange_transaction_id + " " + approval_status);

        ExchangeTransactionDTO request = dao.findTransByTransactionId(exchange_transaction_id);

        if (!"PENDING".equalsIgnoreCase(request.getApproval_status())) {
            throw new RuntimeException("이미 처리된 거래입니다.");
        }

        if ("APPROVED".equalsIgnoreCase(approval_status)) {
            // 계좌 차감
            AccountDTO account = validateAndFetchAccount(
                request.getWithdraw_account_number(), request.getRequest_amount());
            dao.updateAccountBalance(account);

            // 지갑 충전
            handleWalletTransaction(
                request.getCustomer_id(), request.getCurrency_code(),
                request.getExchanged_amount(), request.getExchange_rate());

            // 승인 상태 변경
            dao.updateApprovalStatus(exchange_transaction_id, approval_status);

        } else if ("REJECTED".equalsIgnoreCase(approval_status)) {
            dao.updateApprovalStatus(exchange_transaction_id, approval_status);
        } else {
            throw new IllegalArgumentException("지원하지 않는 승인 상태입니다: " + approval_status);
        }
    }


    // 보유외환 판매
    @Transactional
    public ExchangeTransactionDTO sellForeignCurrency(ExchangeTransactionDTO dto) {
        String customerId = dto.getCustomer_id();
        String currencyCode = dto.getCurrency_code();		
        BigDecimal sellAmount = dto.getRequest_amount();      // 외화 금액
        BigDecimal exchangedKrw = dto.getExchanged_amount();  // 환전 후 받을 KRW
        // BigDecimal exchangeRate = dto.getExchange_rate();		// 외환 환율

        // 1. 외화 지갑 확인
        ExchangeWalletDTO wallet = dao.findWalletByCustomerAndCurrency(customerId, currencyCode);
        if (wallet == null || wallet.getBalance().compareTo(sellAmount) < 0) {
            throw new RuntimeException("외화 지갑 잔액이 부족합니다.");
        }

        // 2. 지갑에서 외화 차감
        wallet.setBalance(wallet.getBalance().subtract(sellAmount));
        dao.updateWalletBalance(wallet);

        // 3. 원화 계좌 입금 처리 (직접 계좌 조회 및 잔액 업데이트)
        AccountDTO account = dao.findAccountByNumber(dto.getWithdraw_account_number());
        if (account == null) {
            throw new RuntimeException("입금할 계좌가 존재하지 않습니다.");
        }
        account.setBalance(account.getBalance().add(exchangedKrw));
        dao.updateAccountBalance(account);

        // 4. 거래 기록 저장
        if (dao.chargeWallet(dto) <= 0) {
            throw new RuntimeException("환전 거래 등록 실패");
        }

        return dao.findTransById(customerId);
    }
    
    // 전체 환전 내역 조회
    public List<ExchangeTransactionDTO> exchangeList(String customer_id){
    	System.out.println("service - exchangeList");
    	
    	return dao.getListById(customer_id);
    }        
    
    // 통화별 평균 매입 환율 (MY지갑 구글차트이용)
    public List<ExchangeWalletDTO> getWalletsWithAverageRate(String customer_id) {
        return dao.findWalletsWithAvgRate(customer_id);
    }

    // 환전신청 내역 조회
    public List<ExchangeTransactionDTO> getRequestList(String customer_id) {
        System.out.println("service - getRequestList");
        
        return dao.getExRequestListById(customer_id);
    }

    // DB 환율 리스트
    @Transactional(readOnly=true)
    public List<Map<String, Object>> getDbExchangeRateList(String base_date){
        System.out.println("service - getExchangeList");
        System.out.println("base_date = " + base_date);
        return dao.getRateByDate(base_date);
    }

    // 환율 DB에 저장
    @Transactional
    public int saveExchangeRates() {
    	
    	List<ExchangeRateDTO> rateList = apiClient.getExchangeRateDTOsForToday(); // API 호출
    	
        int successCount = 0;

        for (ExchangeRateDTO dto : rateList) {
            try {
                Map<String, Object> rate = new HashMap<>();
                rate.put("base_date", LocalDate.now());
                rate.put("currency_code", dto.getCurrency_code());
                rate.put("currency_name", dto.getCurrency_name());

                rate.put("base_rate", toDecimal(dto.getBase_rate()));
                rate.put("buy_rate", toDecimal(dto.getBuy_rate()));
                rate.put("sell_rate", toDecimal(dto.getSell_rate()));

                successCount += dao.insertExchangeRate(rate);
            } catch (Exception e) {
                System.out.println("환율 저장 실패: " + dto.getCurrency_code());
                e.printStackTrace();
            }
        }

        return successCount;
    }
    
    private BigDecimal toDecimal(String raw) {
        if (raw == null || raw.isBlank()) return BigDecimal.ZERO;
        return new BigDecimal(raw.replace(",", "").trim());
    }
}
