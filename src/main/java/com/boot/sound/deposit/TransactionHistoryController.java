package com.boot.sound.deposit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

/**
 * 거래내역 관련 API를 처리하는 컨트롤러
 * - 거래내역 저장 (/api/transactionHistory/save)
 * - 거래내역 조회 (/api/transactionHistory/list)
 */
@RestController
@RequestMapping("/api/transactionHistory")
public class TransactionHistoryController {

    private static final Logger logger = LoggerFactory.getLogger(TransactionHistoryController.class);

    @Autowired
    private TransactionHistoryMapper transactionHistoryMapper;

    /**
     * 새로운 거래내역을 저장하는 API
     * @param params 거래내역 정보 (계좌번호, 금액, 거래유형, 설명)
     * @return 저장 결과 메시지
     */
    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> saveTransaction(@RequestBody Map<String, Object> params) {
        Map<String, String> response = new HashMap<>();
        try {
            logger.info("거래내역 저장 요청 시작");
            logger.info("전체 파라미터: {}", params);
            logger.info("계좌번호: {}", params.get("dat_deposit_account_num"));
            logger.info("금액: {}", params.get("amount"));
            logger.info("거래유형: {}", params.get("transactionType"));
            logger.info("설명: {}", params.get("description"));

            if (params.get("dat_deposit_account_num") == null) {
                logger.error("계좌번호가 null입니다.");
                response.put("message", "계좌번호가 필요합니다.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            transactionHistoryMapper.insertTransaction(params);
            logger.info("거래내역 저장 성공");
            response.put("message", "거래내역이 저장되었습니다.");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("거래내역 저장 실패", e);
            response.put("message", "거래내역 저장에 실패했습니다: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 거래내역을 조회하는 API
     * @param params 조회 조건 (계좌번호, 시작일, 종료일, 년, 월, 거래유형, 정렬순서)
     * @return 조회된 거래내역 목록
     * @throws RuntimeException 거래내역 조회 실패 시 발생
     */
    @PostMapping("/list")
    public ResponseEntity<?> getTransactionHistory(@RequestBody Map<String, Object> params) {
        Map<String, Object> response = new HashMap<>();
        try {
            logger.info("거래내역 조회 요청 시작 - 파라미터: {}", params);
            
            // 필수 파라미터 검증
            if (params.get("dat_deposit_account_num") == null) {
                logger.error("계좌번호가 누락되었습니다.");
                response.put("error", "계좌번호는 필수입니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 계좌번호를 대문자로 변환
            params.put("dat_deposit_account_num", params.get("dat_deposit_account_num").toString().toUpperCase());
            
            logger.info("거래내역 조회 쿼리 실행 전");
            List<TransactionHistoryDTO> result = transactionHistoryMapper.getTransactionHistory(params);
            logger.info("거래내역 조회 쿼리 실행 완료 - 결과 건수: {}", result != null ? result.size() : 0);
            
            if (result == null || result.isEmpty()) {
                logger.info("조회된 거래내역이 없습니다.");
                response.put("data", new ArrayList<>());
                return ResponseEntity.ok(response);
            }
            
            response.put("data", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("거래내역 조회 중 오류 발생", e);
            logger.error("오류 상세 정보: {}", e.getMessage());
            response.put("error", "거래내역 조회에 실패했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
} 