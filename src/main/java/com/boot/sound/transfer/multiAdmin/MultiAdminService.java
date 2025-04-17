package com.boot.sound.transfer.multiAdmin;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.boot.sound.inquire.transfer.TransActionDTO;
import com.boot.sound.transfer.instant.TransInstantService;

import java.sql.Timestamp;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
public class MultiAdminService {

    private final MultiAdminDAO dao;

    @Autowired
    private TransInstantService service;

    // Thread -> 여러이체 동시 실행 
    // ThreadPool -> 미리 정해진 수의 Thread를 풀에 만들어놓고, 필요시 쓰고 다시 넣는 구조, 과부하 방지
    
	 // ThreadPool 사용 이유
	 // 스레드를 매번 새로 만들지 않고 재사용가능
	 // 스레드 수량 제어하면서 서버 과부하 방지
	 // 많은 요청도 안정적으로 처리할 수 있어 대량 처리에 유리
	 // 자원 낭비 없이 효율적으로 동시 처리 가능
    
    // 스레드풀 생성 > 최대 5개 
    private final ExecutorService pool = Executors.newFixedThreadPool(5);

    // 요청리스트 호출
    public List<MultiAdminDTO> getApproveList() {
        return dao.getApproveList();
    }
    
    // 요청건 세부 이체건 상세
    public List<MultiAdminDTO> getTransferDetails(int transfer_id) {
        return dao.getTransferDetails(transfer_id);
    }

    // 요청승인
    @Transactional
    public void approveMultiGroup(String customer_id, Timestamp request_date) {

        // 상태 및 이체시간 업데이트
        dao.updateApprovalStatus(customer_id, request_date, null);
        dao.updateTransferDateNow(customer_id, request_date);

        // 승인 대상 이체 목록 가져오기
        List<MultiAdminDTO> list = dao.findTransfersByGroup(customer_id, request_date);

        for (MultiAdminDTO dto : list) {
            pool.submit(() -> {
                try {
                	
                	// 한도 검사
                    try {
                        service.checkTransferLimit(dto.getCustomer_id(), dto.getAmount().intValue());
                    } catch (IllegalArgumentException e) {
                        System.out.println("이체 한도 초과: " + dto.getCustomer_id() + ", 금액: " + dto.getAmount());
                        return;
                    }

                    // 출금 처리
                    dao.decreaseBalance(dto.getOut_account_number(), dto.getAmount());

                    // 입금 처리
                    dao.increaseBalance(dto.getIn_account_number(), dto.getAmount());

                    // 출금 내역 저장
                    TransActionDTO out = new TransActionDTO();
                    out.setAccount_number(dto.getOut_account_number());
                    out.setTransaction_type("출금");
                    out.setAmount(dto.getAmount());
                    out.setComment(dto.getMemo());
                    out.setCustomer_name(dto.getCustomer_id());
                    out.setAccount_type("다건이체");

                    dao.insertTransaction(out);

                    // 입금 내역 저장
                    TransActionDTO in = new TransActionDTO();
                    in.setAccount_number(dto.getIn_account_number()); // 수정됨
                    in.setTransaction_type("입금");
                    in.setAmount(dto.getAmount());
                    in.setComment(dto.getMemo());
                    in.setCustomer_name(dto.getIn_name()); // 수취인 이름
                    in.setAccount_type("다건이체");

                    dao.insertTransaction(in);

                } catch (Exception e) {
                    System.out.println("이체 스레드 오류: " + e.getMessage());
                }
            });
        }
    }
    
    // 요청거절
    @Transactional
    public void rejectGroup(String customer_id, Timestamp request_date, String reason) {
        dao.updateRejectStatus(customer_id, request_date, reason);
    }
}