package com.boot.sound.deposit.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class DepositAutoTransferDTO {
    private int autoTransferId;     // 자동이체번호
    private int datId;              // 예금번호
    private String fromAccount;     // 출금계좌
    private String toAccount;       // 입금계좌
    private BigDecimal amount;      // 이체금액
    private String transferType;    // 이체구분 (정기/수시)
    private int transferDay;        // 이체일자
    private Date startDate;         // 시작일자
    private Date endDate;           // 종료일자
    private String status;          // 상태
} 