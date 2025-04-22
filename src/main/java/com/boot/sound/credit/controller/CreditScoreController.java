package com.boot.sound.credit.controller;

import com.boot.sound.credit.service.CreditScoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CreditScoreController {

    private final CreditScoreService creditScoreService;

    @PostMapping("/credit-score-request")
    public ResponseEntity<?> getCreditScore(@RequestBody Map<String, String> payload) {
        String customerId = payload.get("customerId");
        System.out.println("✅ 신용점수 요청 - 고객 ID: " + customerId);

        Map<String, Object> result = creditScoreService.requestPrediction(customerId);
        double creditScore = Double.parseDouble(result.get("score").toString());

        // ✅ 응답 구조 명확히 가공
        return ResponseEntity.ok(Map.of(
            "creditScore", Math.round(creditScore),
            "rawFeatures", result.get("features")
        ));
    }
}
