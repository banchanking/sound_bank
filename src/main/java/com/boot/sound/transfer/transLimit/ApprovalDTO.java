package com.boot.sound.transfer.transLimit;

import java.sql.Timestamp;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprovalDTO {
	private int approval_id;
	private int transfer_id;
	private String approval_type; // "한도"
	private Integer approval_limit; // 승인한도
	private String status; // "승인"
	private String reject_reason;
	private Timestamp approval_date;
}
