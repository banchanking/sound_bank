package com.boot.sound.transfer.transLimit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transLimit")
public class TransLimitController {

    @Autowired
    private TransLimitService service;
    
    // [고객] 기존한도 조회
    @GetMapping("/approvedLimit/{customer_id}")
    public Integer getApprovedLimit(@PathVariable String customer_id) {
        return service.getLatestApprovedLimit(customer_id);
    }
    
    // [고객] 요청목록 조회
    @GetMapping("/list/{customer_id}")
    public List<TransLimitDTO> getList(@PathVariable String customer_id) {
        return service.getListByCustomerId(customer_id);
    }

    // [고객] 이체한도 변경요청 등록
    @PostMapping("/insert")
    public ResponseEntity<?> insert(@RequestBody TransLimitDTO dto) {
        boolean success = service.insert(dto);

        if (!success) {
            return ResponseEntity.badRequest().body("이미 대기 중인 요청이 존재합니다.");
        }
        return ResponseEntity.ok().build();
    }

    // [고객] 요청 수정
    @PutMapping("/update")
    public void update(@RequestBody TransLimitDTO dto) {
        service.update(dto);
    }

    // [고객] 요청 삭제
    @DeleteMapping("/delete/{transfer_id}")
    public void delete(@PathVariable int transfer_id) {
        service.delete(transfer_id);
    }

    // [관리자용] 전체 요청목록 조회
    @GetMapping("/admin/list")
    public List<TransLimitDTO> getAllList() {
        return service.getAllList();
    }
    
    // [관리자] 승인
    @PostMapping("/admin/approve")
    public void approve(@RequestBody ApprovalDTO admindto) {
        service.approve(admindto);  // approval_tbl에 approval_limit 저장
    }

    // [관리자] 거절
    @PostMapping("/admin/reject")
    public void reject(@RequestBody ApprovalDTO admindto) {
        service.reject(admindto);  // approval_tbl에 reject_reason 포함 등록
    }
}
