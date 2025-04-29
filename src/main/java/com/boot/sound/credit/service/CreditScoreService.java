package com.boot.sound.credit.service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.boot.sound.credit.dao.CreditScoreDAO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

@Slf4j
@RequiredArgsConstructor
@Service
public class CreditScoreService {

	 private final CreditScoreDAO creditScoreDAO;

	    public Map<String, Object> generateFeatures(String customerId) {
	    	 Map<String, Object> feature = new LinkedHashMap<>(); // 🔥 순서 보장용

	        int lateCount3m = creditScoreDAO.getLateCount3Months(customerId);
	        Long loanTotal = creditScoreDAO.getTotalLoanAmount(customerId);
	        Long balanceTotal = creditScoreDAO.getTotalLoanBalance(customerId);
	        Long assetTotal = creditScoreDAO.getTotalAssets(customerId);
	        double completeRate = creditScoreDAO.getCompletedTermRatio(customerId);

	        double debtToAsset = (assetTotal == 0) ? 0 : (double) balanceTotal / (assetTotal + 1);

	        feature.put("late_count_3m", lateCount3m);
	        feature.put("loan_total_amount", loanTotal);
	        feature.put("loan_balance_total", balanceTotal);
	        feature.put("asset_total", assetTotal);
	        feature.put("debt_to_asset_ratio", Math.round(debtToAsset * 10000) / 10000.0);
	        feature.put("completed_term_ratio", completeRate);

	        return feature;
	    }
	    
	    public Map<String, Object> requestPrediction(String customerId) {
	        Map<String, Object> feature = generateFeatures(customerId);  // ← 우리가 만든 feature 생성 로직

	        // Flask 요청 설정
	        HttpHeaders headers = new HttpHeaders();
	        headers.setContentType(MediaType.APPLICATION_JSON);

	        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(feature, headers);

	        String flaskUrl = "http://3.39.177.144:5001/predict-credit-score";
	        RestTemplate restTemplate = new RestTemplate();

	        try {
	            ResponseEntity<Map> response = restTemplate.postForEntity(flaskUrl, requestEntity, Map.class);

	            if (response.getStatusCode() == HttpStatus.OK) {
	            	double predictedScore = Double.parseDouble(response.getBody().get("predicted_credit_score").toString());
	            	
	            	// 📝 DB에 신용점수 저장
	                creditScoreDAO.saveCreditScore(customerId, predictedScore);
	                
	                Map<String, Object> result = new HashMap<>();
	                result.put("score", response.getBody().get("predicted_credit_score"));
	                result.put("features", feature);  // 나중에 저장용으로 활용 가능
	                return result;
	            } else {
	                throw new RuntimeException("Flask 예측 실패: " + response.getStatusCode());
	            }
	        } catch (Exception e) {
	            e.printStackTrace();
	            throw new RuntimeException("Flask 연결 실패: " + e.getMessage());
	        }
	    }
}
