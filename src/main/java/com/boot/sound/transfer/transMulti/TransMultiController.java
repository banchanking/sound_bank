package com.boot.sound.transfer.transMulti;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/transMulti")
public class TransMultiController {

	@Autowired
	private TransMultiService service;
	
	// 비번확인
	@PostMapping("/checkPwd")
    public boolean checkPassword(@RequestBody Map<String, String> payload) {
        String accountNumber = payload.get("account_number");
        String password = payload.get("password");

        return service.checkPwd(accountNumber, password);
    }
	
	// 다건이체 요청저장
	@PostMapping("/add")
	public String sendMulti(@RequestBody TransMultiDTO dto) {
		service.sendMulti(dto);
		
		return "다건이체요청 정상적으로 접수되었습니다.";
	}
	
	// 다건이체 목록
	@GetMapping("/list/{customer_id}")
    public List<Map<String, Object>> list(@PathVariable("customer_id") String customer_id){
    	return service.getMultiListByCustomer(customer_id);
	}
	
	// 다건이체 수정
	@PutMapping("/update")
	public void update(@RequestBody Map<String, Object> data) {
		service.updateMulti(data);
	}
	
	// 다건이체 삭제
	@DeleteMapping("/delete/{transfer_id}")
	public void delete(@PathVariable int transfer_id) {
        service.deleteMulti(transfer_id);
    }
}