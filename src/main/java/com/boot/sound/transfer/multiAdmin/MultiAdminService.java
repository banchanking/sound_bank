package com.boot.sound.transfer.multiAdmin;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MultiAdminService {
    
    @Autowired
    private MultiAdminDAO dao;
    
    // 스레드풀 생성 (동시 실행할 스레드 수 설정)
    private final ExecutorService pool = Executors.newFixedThreadPool(5);

    // 요청목록
    public List<Map<String, Object>> approveList(){
        return dao.getApproveList();
    }

    // 목록상세 (request_date, out_account_number, memo로 상세 조회)
    public Map<String, Object> approveDetail(int transfer_id) {
        List<Map<String, Object>> resultList = dao.getApproveDetail(transfer_id);
        
        // 결과가 비어 있지 않다면 첫 번째 값 리턴
        return resultList.isEmpty() ? null : resultList.get(0);
    }

    // 요청승인 (이체실행)
    @Transactional
    public void approveMulti(int transfer_id) {
        // 승인날짜 업데이트
        dao.updateApprovalDate(transfer_id); // 승인 처리 (status = '승인', approval_date = NOW())

        // 승인된 이체건들 가져옴 (여러 건)
        List<Map<String, Object>> transferList = dao.getTransForApprove(transfer_id);

        // 각 이체 건에 대해 스레드로 이체 실행
        for (Map<String, Object> transfer : transferList) {
            pool.submit(() -> {
                try {
                    dao.tranMultiAction(transfer);  // 실제 이체 실행
                } catch (Exception e) {
                    e.printStackTrace();  // 오류가 발생한 경우 로깅
                }
            });
        }
    }

    // 요청거절
    public void rejectMulti(Map<String, Object> data) {
        dao.updateRejectMulti(data);  // 거절 처리 (status = '거절', reject_reason = 'reason')
    }
}
