package com.boot.sound.transfer.transLimit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class TransLimitService {

    @Autowired
    private TransLimitDAO dao;

    // 요청정보 조회
    public List<TransLimitDTO> getListByCustomerId(String customer_id) {
        return dao.getLimitList(customer_id);
    }

    // 한도변경 요청
    public void insert(TransLimitDTO dto) {
        dao.insertLimit(dto);
    }

    // 변경요청 수정
    public void update(TransLimitDTO dto) {
        dao.updateLimit(dto);
    }

    // 변경요청 삭제
    public void delete(int transfer_id) {
        dao.deleteLimit(transfer_id);
    }
    
    // 관리자 - 요청목록
    public List<TransLimitDTO> getAllList() {
        return dao.getAllLimitList();
    }

    // 관리자 - 승인
    public void approve(TransLimitDTO dto) {
        dao.approveLimit(dto); 
    }

    // 관리자 - 거절
    public void reject(TransLimitDTO dto) {
        dao.rejectLimit(dto);
    }
}
