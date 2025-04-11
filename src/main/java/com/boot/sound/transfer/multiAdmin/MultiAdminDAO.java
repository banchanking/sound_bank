package com.boot.sound.transfer.multiAdmin;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MultiAdminDAO {

	// 요청목록
	public List<Map<String, Object>> getApproveList();
	
	// 목록상세(request_date, out_account_number, memo 기준으로 상세 내역 조회)
	public List<Map<String, Object>> getApproveDetail(int transfer_id);

	// 요청승인
	public void updateApprovalDate(int transfer_id);
	
	// 승인한 이체건 가져오기
	public List<Map<String, Object>> getTransForApprove(int transfer_id);
	
	// 이체실행
	public void tranMultiAction(Map<String,Object> map);
	
	// 요청거절
	public void updateRejectMulti(Map<String, Object> data);// data: transfer_id, reject_reason
}
