package com.boot.sound.deposit.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 예금 상품 정보를 담는 DTO 클래스
 * - DEPOSIT_PRODUCT_TBL 테이블의 컬럼과 매핑되는 필드들을 포함
 * - Lombok @Data 어노테이션으로 getter, setter, toString 등을 자동 생성
 */
@Data
public class DepositProductDTO {
    /** 상품 ID (기본키) */
    private Long productId;
    
    /** 상품명 */
    private String productName;
    
    /** 상품 유형 */
    private String productType;
    
    /** 이자율 */
    private BigDecimal interestRate;
    
    /** 최소 금액 */
    private BigDecimal minAmount;
    
    /** 최대 금액 */
    private BigDecimal maxAmount;
    
    /** 만기 기간 (개월) */
    private Integer termMonths;
    
    /** 상품 설명 */
    private String description;
    
    /** 생성 일시 */
    private LocalDateTime createdAt;
    
    /** 수정 일시 */
    private LocalDateTime updatedAt;
} 