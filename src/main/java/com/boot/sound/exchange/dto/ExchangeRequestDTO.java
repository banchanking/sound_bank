package com.boot.sound.exchange.dto;

import java.sql.Timestamp;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name="EXCHANGE_REQUEST")
public class ExchangeRequestDTO {
	
	@Id
	private int exchange_request_id;
	private String customer_id;
	private int exchange_account_id;
	private String to_currency;
	private String from_currency;
	private int requested_amount;
	private String status;
	private Timestamp request_date;
	private Timestamp processed_date;
	
}
