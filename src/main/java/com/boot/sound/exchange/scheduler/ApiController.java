package com.boot.sound.exchange.scheduler;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.boot.sound.exchange.service.ExchangeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/exchange") // base path 지정
@CrossOrigin
public class ApiController {

    private final ExchangeService exchangeService;
    // 테스트용 컨트롤러
    @PostMapping("/save") // 실제 호출 경로: POST /api/exchange/save 
    public ResponseEntity<String> saveExchangeRates() {
        int savedCount = exchangeService.saveExchangeRates();
        return ResponseEntity.ok("환율 저장 완료: " + savedCount + "건");
    }
}
