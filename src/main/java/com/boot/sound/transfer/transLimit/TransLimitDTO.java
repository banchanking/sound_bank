package com.boot.sound.transfer.transLimit;

import java.sql.Timestamp;

import lombok.Data;

@Data
public class TransLimitDTO {
	private int transfer_id;
	private String customer_id;
	private String out_account_number;
	private String transfer_type; // "한도"
	private Integer requested_limit; // 요청한도
	private String reason;
	private String status;
	private Timestamp request_date;
	private Integer approval_limit;
	private Timestamp approval_date;
	private String reject_reason;
}