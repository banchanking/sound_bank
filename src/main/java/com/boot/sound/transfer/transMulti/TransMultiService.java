package com.boot.sound.transfer.transMulti;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.boot.sound.transfer.transMulti.TransMultiDTO.InList;

@Service
public class TransMultiService {

	@Autowired
	private TransMultiDAO dao;
	@Autowired
	private PasswordEncoder encoder;

	public boolean checkAccountPassword(String accountNumber, String inputPassword) {
	    String realPassword = dao.findPasswordByAccount(accountNumber);

	    return realPassword != null && encoder.matches(inputPassword, realPassword);
	}
	

    public void sendMulti(TransMultiDTO dto) {
        List<InList> list = dto.getInList();

        for (InList in : list) {
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
                
                // 마지막 transfer_id 가져오기
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