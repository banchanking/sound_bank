package com.boot.sound.deposit;

import java.sql.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
@Entity
@Table(name="DEPOSIT_ACCOUNT_TBL")
public class DepositDTO {

    @Id
    @Column(name = "dat_account_num") // 데이터베이스 컬럼 이름과 매핑
    private String dat_account_Num;

    @Column(name = "dat_customer_name")
    private String dat_customer_Name;

    @Column(name = "dat_balance")
    private int dat_balance;

    @Column(name = "dat_account_type")
    private String dat_account_Type;

    @Column(name = "dat_open_date")
    private Date dat_openDate;
	
	
}
