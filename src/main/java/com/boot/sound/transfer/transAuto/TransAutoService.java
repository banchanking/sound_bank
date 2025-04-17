package com.boot.sound.transfer.transAuto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.sound.transfer.instant.TransInstantService;

@Service
public class TransAutoService {

    @Autowired
    private TransAutoDAO dao;

    @Autowired
    private TransInstantService service;
    
    // 자동이체 등록
    public void saveTransAuto(TransAutoDTO dto) {
        dao.insertAutoTransfer(dto);
    }
    
    // 비밀번호 확인
    public boolean checkPassword(String accountNum, String password) {
        String pwd = dao.getPasswordByAccount(accountNum);
        return pwd != null && pwd.equals(password);
    }
    
    // 자동이체 목록
    public List<TransAutoDTO> getAutoList(String customer_id){
    	return dao.getAutoList(customer_id);
    }

    // 자동이체 수정
    public void updateTransAuto(TransAutoDTO dto) {
    	dao.updateAutoTransfer(dto);
    }
    
    // 자동이체 삭제
    public void deleteTransAuto(String transfer_id) {
    	dao.deleteAutoTransfer(transfer_id);
    }
    
    // ---------------------- 자동이체 실행 부분 -----------------------------    

    // 자동이체 실행 (스케줄러에서 주기적으로 호출됨)
    public void runTransAuto() {
        String nowTime = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")); // 현재 시각
        int todayDay = LocalDate.now().getDayOfMonth();  // 오늘 날짜 (1~31)
        int weekDay = LocalDate.now().getDayOfWeek().getValue(); // 요일

        // 요일 방식 자동이체 가져오기
        List<TransAutoDTO> dayList = dao.getDayModeTransfers(weekDay, nowTime);
        // 매월 지정일 자동이체 가져오기
        List<TransAutoDTO> monthList = dao.getMonthlyTransfers(todayDay, nowTime);

        // 두 목록 합치기
        dayList.addAll(monthList);

        
        // 자동이체 수행
        for (TransAutoDTO dto : dayList) {
            int balance = dao.getBalance(dto.getOut_account_number()); // 잔액 확인

            // 한도 검사
            try {
                service.checkTransferLimit(dto.getCustomer_id(), dto.getAmount());
            } catch (IllegalArgumentException e) {
            	System.out.println("당일 이체한도 초과되었습니다");
                continue;
            }
            
            
            if (balance >= dto.getAmount()) {
            	// 출금
                dao.updateBalance(dto.getOut_account_number(), -dto.getAmount()); 
                
                // 입금
                dao.updateBalance(dto.getIn_account_number(), dto.getAmount());
                
                // 계좌타입
                String outType = dao.getAccountOutType(dto.getOut_account_number());
                dto.setOut_account_type(outType);  

                String inType = dao.getAccountInType(dto.getIn_account_number());
                dto.setIn_account_type(inType);    
                
                // 고객이름 조회
                String name = dao.getCustomerName(dto.getCustomer_id());
                dto.setCustomer_name(name);
                
                // 거래내역 저장
                dao.saveTransactionOut(dto);  // 출금
                dao.saveTransactionIn(dto);   // 입금

                System.out.println("이체 성공: " + dto.getOut_account_number());
            } else {
                System.out.println("잔액 부족: " + dto.getOut_account_number());
            }
        }
    }
}
