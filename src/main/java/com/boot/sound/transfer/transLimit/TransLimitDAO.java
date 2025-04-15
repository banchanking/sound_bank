package com.boot.sound.transfer.transLimit;

import java.sql.Timestamp;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

@Mapper
public interface TransLimitDAO {
    
	// 요청정보 조회
    public List<TransLimitDTO> getLimitList(String customer_id);

    // 변경요청 저장
    public void insertLimit(TransLimitDTO dto);
    
    // 변경요청 수정
    public void updateLimit(TransLimitDTO dto);
    
    // 변경요청 삭제
    public void deleteLimit(int transfer_id);

    // 관리자 - 요청목록 조회
    public List<TransLimitDTO> getAllLimitList();
    
    // 관리자 - 승인
    public void approveLimit(TransLimitDTO dto);
    
    // 관리자 - 거절
    public void rejectLimit(TransLimitDTO dto);

}
