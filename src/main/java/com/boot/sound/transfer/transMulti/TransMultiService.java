package com.boot.sound.transfer.transMulti;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.boot.sound.transfer.transMulti.TransMultiDTO.InList;

@Service
public class TransMultiService {

    @Autowired
    private TransMultiDAO dao;
    
    // 비밀번호 확인
    public boolean isPasswordMatch(String accountNumber, String inputPassword) {
        String realPassword = dao.findPasswordByAccount(accountNumber);
        return realPassword != null && realPassword.equals(inputPassword);
    }
    

    // Thread -> 여러이체 동시 실행 
    // ThreadPool -> 미리 정해진 수의 Thread를 풀에 만들어놓고, 필요시 쓰고 다시 넣는 구조, 과부하 방지
    
	 // ThreadPool 사용 이유
	 // 스레드를 매번 새로 만들지 않고 재사용해서 성능이 좋아짐
	 // 동시에 실행되는 스레드 수를 제한해서 서버 과부하 방지
	 // 처리할 작업을 큐에 넣고 자동으로 관리되기 때문에 편리
	 // 많은 요청도 안정적으로 처리할 수 있어 대량 처리에 유리
	 // 자원 낭비 없이 효율적으로 동시 처리 가능
    
    // 최대 5개까지 동시에 처리하는 스레드 풀 생성
    private final ExecutorService pool = Executors.newFixedThreadPool(5);

    public void sendMulti(TransMultiDTO dto) {
        List<InList> list = dto.getInList();

        for (InList in : list) {
            pool.submit(() -> {
            	 synchronized (this) {
                Map<String, Object> map = new HashMap<>();
                map.put("customer_id", dto.getCustomer_id());
                map.put("out_account_number", dto.getOut_account_number());
                map.put("password", dto.getPassword());
                map.put("memo", in.getMemo());
                map.put("in_account_number", in.getIn_account_number());
                map.put("amount", in.getAmount());
                map.put("in_name", in.getIn_name());
                map.put("request_date", dto.getRequest_date()); // 요청일
                map.put("status", "대기");
                map.put("transfer_type", "다건");
                map.put("reject_reason", null); // 거절사유 생략
                map.put("approval_date", null); // 승인일 생략

                dao.addTransferMulti(map); // DAO는 map으로 받도록 수정
                
                // transfer_id 가져오기
                Integer transfer_id = dao.getLastTransferIdMulti(dto.getCustomer_id());  // Mapper에서 max(id)로 가져오게

                // approval_tbl 저장
                Map<String, Object> approvalMap = new HashMap<>();
                approvalMap.put("transfer_id", transfer_id);
                approvalMap.put("approval_type", "다건");
                approvalMap.put("status", "대기");
                approvalMap.put("reject_reason", null);
                approvalMap.put("approval_date", null);

                dao.insertApprovalMulti(approvalMap);
            	 }
            });
        }
    }
    
    // 다건이체 조회
    public List<Map<String, Object>> getMultiListByCustomer(String customer_id) {
        return dao.getMultiListByCustomer(customer_id);
    }
    
    // 다건이체 수정
    public void updateMulti(Map<String, Object> data) {
    	dao.updateMultiTransfer(data);
    }
    
    // 다건이체 삭제
    public void deleteMulti(int transfer_id) {
    	dao.deleteMultiTransfer(transfer_id);
    }
    
    
}