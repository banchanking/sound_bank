package com.boot.sound.transfer.transMulti;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TransMultiDAO {
	
	// 비번확인
	public String findPasswordByAccount(String accountNumber);
	
	// 다건이체 요청 저장
	public void addTransferMulti(Map<String, Object> map);
	
	// 마지막 transfer_id 가져오기 
    public Integer getLastTransferIdMulti(String customer_id);
    
	// 다건이체 요청내용 관리자테이블 저장
	void insertApprovalMulti(Map<String, Object> map);
    
	// 다건이체 목록
    public List<Map<String, Object>> getMultiListByCustomer(String customer_id);
    
    // 다건이체 단건 수정
    public void updateMultiTransfer(Map<String, Object> data);
    
    // 다건이체 단건 삭제
    public void deleteMultiTransfer(int transfer_id);
}