package com.boot.sound.transfer.transAuto;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transAuto")
public class TransAutoController {

    @Autowired
    private TransAutoService service;

    // 자동이체 등록
    @PostMapping("/add")
    public String add(@RequestBody TransAutoDTO dto) {
        // 비밀번호 확인
        boolean ok = service.checkPassword(dto.getOut_account_number(), dto.getPassword());

        if (!ok) {
            return "비밀번호 오류";
        }

        // 누락될 수 있는 기본값 보완
        dto.setTransfer_type("자동");   // 이체 유형 고정
        dto.setActive_yn("Y");          // 기본 사용 상태

        service.saveTransAuto(dto);
        
        return "자동이체 등록완료";
    }
    
    // 자동이체 목록 
    @GetMapping("/list/{customer_id}")
    public List<TransAutoDTO> list(@PathVariable("customer_id") String customer_id){
    	return service.getAutoList(customer_id);
    }
    
    // 자동이체 수정 
    @PutMapping("/update")
    public String update(@RequestBody TransAutoDTO dto) {
    	service.updateTransAuto(dto);
    	return " ";
    }
    
    // 자동이체 삭제
    @DeleteMapping("/delete/{transfer_id}")
    public String delete(@PathVariable String transfer_id) {
    	service.deleteTransAuto(transfer_id);
    	return " ";
    }
    
    
    
    
    
    
    
    
    
}
