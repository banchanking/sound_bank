package com.boot.sound.deposit;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 거래내역 정보를 담는 DTO 클래스
 * DEPOSIT_TRANSACTION_TBL 테이블의 데이터를 매핑하기 위해 사용
 */
@Data
public class TransactionHistoryDTO {
    /** 거래 고유 ID */
    private String transactionId;
    
    /** 계좌번호 (예금계좌번호) */
    private String datDepositAccountNum;
    
    /** 거래 발생 일시 */
    private LocalDateTime transactionDate;
    
    /** 거래 금액 */
    private BigDecimal amount;
    
    /** 거래 유형 */
    private String transactionType;
    
    /** 거래 설명 */
    private String description;
} 