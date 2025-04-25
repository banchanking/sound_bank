package com.boot.sound.deposit;

import java.math.BigDecimal;
import java.sql.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

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
public class DepositProducDTO {
	
	// 데이터베이스 컬럼 이름과 매핑
	@Id
	@Column(name = "dat_id")                     // 예금 번호
	private int dat_id;


}
