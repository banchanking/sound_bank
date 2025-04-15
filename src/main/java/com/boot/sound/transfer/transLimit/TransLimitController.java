package com.boot.sound.transfer.transLimit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transLimit")
public class TransLimitController {

    @Autowired
    private TransLimitService service;

    // [고객용] 내 요청 목록 조회
    @GetMapping("/list/{customer_id}")
    public List<TransLimitDTO> getList(@PathVariable String customer_id) {
        return service.getListByCustomerId(customer_id);
    }

    // [관리자용] 전체 요청 조회
    @GetMapping("/admin/list")
    public List<TransLimitDTO> getAllList() {
        return service.getAllList();
    }

    // 등록
    @PostMapping("/insert")
    public void insert(@RequestBody TransLimitDTO dto) {
        service.insert(dto);
    }

    // 수정
    @PutMapping("/update")
    public void update(@RequestBody TransLimitDTO dto) {
        service.update(dto);
    }

    // 삭제
    @DeleteMapping("/delete/{transfer_id}")
    public void delete(@PathVariable int transfer_id) {
        service.delete(transfer_id);
    }

    @PostMapping("/admin/approve")
    public void approve(@RequestBody TransLimitDTO dto) {
        service.approve(dto); 
    }

    // 거절
    @PostMapping("/admin/reject")
    public void reject(@RequestBody TransLimitDTO dto) {
        service.reject(dto);
    }
}
