package com.boot.sound.transfer.transAuto;

	import lombok.Data;
	
	@Data 
	public class TransAutoDTO {
	    private String customer_id;         // 사용자 ID
	    private String transfer_id;         // 사용자 ID
	    private String out_account_number;  // 출금 계좌번호
	    private String in_account_number;   // 입금 계좌번호
	    private String in_name;             // 받는 사람 이름
	    private int amount;                 // 이체 금액
	    private String memo;                // 메모
	    private int schedule_day;           // 요일 (1~7: 월~일)
	    private String schedule_time;       // 시간
	    private int schedule_month_day;     // 매월 지정일
	    private String password;            // 비밀번호
	    private String transfer_type;       // 이체 유형 ("자동")
	    private String schedule_mode;       // 이체 방식 (매월지정일, 매주요일, 특정일)
	    private String active_yn;           // 자동이체 사용 여부 (Y/N)
}
