package com.boot.sound.transfer.transAuto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 자동이체 실행을 위한 스케줄러 클래스
 * - 일정 시간마다 자동으로 runAuto() 메서드를 실행해 자동이체 처리
 */

@Component
public class TransAutoScheduler {
	
	@Autowired
	private TransAutoService service;
	
	@Scheduled(cron = "0 * * * * *")
	public void runAuto() {
		//System.out.println("스케줄러 시작");
		service.runTransAuto();
		//System.out.println("스케줄러 종료");
	}

/*	
	cron 표현식
	
	초 분 시 일 월 요일
	
	0 0 9 * * *       매일 오전 9시
	0 30 22 * * *     매일 밤 10시 30분
	0 0 9 * * MON     매주 월요일 오전 9시
	0 * * * * *       매 1분마다
	0 0/10 * * * *    10분마다 실행
	0 0 0 1 * *       매달 1일 0시 정각
*/
	
}
