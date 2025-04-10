package com.boot.sound.transfer.instant;

import lombok.Data;
import java.util.Date;

import javax.persistence.*;

@Data
@Entity
@Table(name = "TRANSFER_TBL")
public class TransInstantDTO {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TRANSFER_ID")
    private int transfer_id; // 이체 고유 번호

    @Column(name = "CUSTOMER_ID")
    private String customer_id; // 고객 아이디

    @Column(name = "OUT_ACCOUNT_NUMBER")
    private String out_account_number; // 출금 계좌

    @Column(name = "IN_ACCOUNT_NUMBER")
    private String in_account_number; // 입금 계좌

    @Column(name = "IN_NAME")
    private String in_name; // 받는 사람 이름

    @Column(name = "TRANSFER_TYPE")
    private String transfer_type; // 이체 유형 (예: 실시간, 자동, 다건)

    @Column(name = "AMOUNT")
    private int amount; // 이체 금액

    @Column(name = "SCHEDULE_DAY")
    private Integer schedule_day; // 자동이체 요일 (실시간이면 null)

    @Column(name = "ACTIVE_YN")
    private String active_yn; // 자동이체 사용 여부 (Y/N)

    @Column(name = "REQUESTED_LIMIT")
    private Integer requested_limit; // 한도 변경 요청 금액

    @Column(name = "REASON")
    private String reason; // 이체 또는 한도 변경 사유

    @Column(name = "MEMO")
    private String memo; // 이체 메모

    @Column(name = "TRANSFER_DATE")
    @Temporal(TemporalType.TIMESTAMP) // 날짜+시간 형태로 저장 (예: 2025-03-30 10:30:00)
    private Date transfer_date; // 이체일
        
    @Transient // DB에는 저장 안됨
    private String password;
}
