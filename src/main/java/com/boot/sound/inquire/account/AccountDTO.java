package com.boot.sound.inquire.account;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

@Data
@Entity
@Table(name = "ACCOUNT_TBL")
public class AccountDTO {

    @Id
    @Column(name = "ACCOUNT_NUMBER")
    private String accountNumber;           // 계좌번호

    @Column(name = "CUSTOMER_ID")
    private String customer_id;              // 고객 ID

    @Column(name = "ACCOUNT_TYPE")
    private String account_type;             // 계좌 타입

    @Column(name = "BALANCE")
    private BigDecimal balance;                    // 잔액

    @Column(name = "INTEREST_RATE")
    private BigDecimal interest_rate;            // 이자율 (예적금용)

    @Column(name = "YIELD_RATE")
    private BigDecimal yield_rate;               // 수익률 (펀드용)

    @Column(name = "CURRENCY_TYPE")
    private String currency_type;            // 통화 (KRW, USD 등)

    @Column(name = "ACCOUNT_NAME")
    private String account_name;             // 계좌 이름

    @Column(name = "OPEN_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date open_date;                  // 개설일
    
    @Column(name = "STATUS")
    private String status;                // 계좌상태

    @Column(name = "CLOSE_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date close_date;              // 해지일

    @Column(name = "UPDATED_AT")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updated_at;              // 변경일

    @Column(name = "ACCOUNT_PWD")
    private int account_pwd;              // 계좌비밀번호

    @Transient
    private String account_number_column;    // 타입별 실제 컬럼명 (DB 저장 안 됨)
    
    public String getAccount_number() {
        return this.accountNumber;
    }

    public void setAccount_number(String account_number) {
        this.accountNumber = account_number;
    }
    
    
    
    
    
    
}