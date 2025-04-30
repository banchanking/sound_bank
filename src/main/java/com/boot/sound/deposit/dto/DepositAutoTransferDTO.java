package com.boot.sound.deposit.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DepositAutoTransferDTO
 * 자동이체 등록/조회에 사용되는 데이터 전송 객체
 */
@Data
public class DepositAutoTransferDTO {
    // 출금할 기본 입출금 계좌 번호
    private String withdrawAccountNumber;

    // 입금할 예적금 계좌 번호
    private String targetAccountNumber;

    // 입금할 계좌 타입 (DEPOSIT: 예금 / SAVINGS: 적금)
    private String targetAccountType;

    // 이체할 금액
    private BigDecimal transferAmount;

    // 매월 며칠에 이체할지 (1 ~ 28)
    private Integer transferDay;

    // 이체 상태 (ACTIVE / INACTIVE)
    private String transferStatus;

    // 자동이체 등록 시각
    private LocalDateTime createdAt;
    
    private Long id;
}