package com.boot.sound.transfer.instant;

import java.math.BigDecimal;

public interface TransInstantDAO {
	
	// 승인한도 조회
	int getApprovedLimit(String customer_id);

	// 오늘 이체금액 총합
	BigDecimal getTodayTotal(String customer_id);
}
