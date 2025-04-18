package com.boot.sound.deposit;

import java.math.BigDecimal;
import java.sql.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

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

	// 데이터베이스 컬럼 이름과 매핑
	@Id
	@Column(name = "dat_id")                     // 예금 번호
	private int dat_id;

	@Column(name = "dat_account_num")            // 출금계좌번호
	private String dat_account_num;

	@Column(name = "dat_account_pwd")            // 출금계좌번호 비밀번호
	private String dat_account_pwd;

	@JsonProperty("dat_deposit_account_num") 	 // JSON 키와 매핑
	@Column(name = "dat_deposit_account_num")    // 예금계좌
	private String dat_deposit_account_num;

	@Column(name = "dat_deposit_account_pwd")    // 예금계좌 비밀번호
	private String dat_deposit_account_pwd;

	@JsonProperty("dat_new_amount") 			 // JSON 키와 매핑
	@Column(name = "dat_new_amount")             // 신규 금액
	private BigDecimal dat_new_amount;

	@Column(name = "dat_balance")                // 현재 잔액
	private BigDecimal dat_balance;

	@Column(name = "dat_term")                   // 가입기간 3,6,12개월중 하나
	private String dat_term;

	@JsonProperty("dat_transaction_type") 		 // JSON 키와 매핑
	@Column(name = "dat_transaction_type")       // 거래 유형 (입금/출금)
	private String dat_transaction_type;

	@CreationTimestamp
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy/MM/dd") // 날짜 형식 지정
	@Column(name = "dat_start_day") // 가입일
	private Date dat_start_day;

	@CreationTimestamp
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy/MM/dd") // 날짜 형식 지정
	@Column(name = "dat_end_day") // 만료일
	private Date dat_end_day;
	
}
