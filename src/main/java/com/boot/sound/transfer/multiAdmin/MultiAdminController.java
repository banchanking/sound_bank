package com.boot.sound.transfer.multiAdmin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/multiAdmin")
public class MultiAdminController {

    @Autowired
    private MultiAdminService service;

    // 요청목록
    @GetMapping("/approveList")
    public List<Map<String, Object>> getApproveList() {
        return service.approveList();
    }

    // 요청상세 (request_date, out_account_number, memo)
    @GetMapping("/approveDetail/{transfer_id}")
    public Map<String, Object> getApproveDetail(@PathVariable int transfer_id) {
        // 서비스에서 transfer_id로 상세 조회
        return service.approveDetail(transfer_id);
    }

    // 요청승인
    @PostMapping("/approveMulti/{transfer_id}")
    public void approve(@PathVariable int transfer_id) {
        service.approveMulti(transfer_id);
    }

    // 요청반려
    @PostMapping("/rejectMulti")
    public void reject(@RequestBody Map<String, Object> data) {
        service.rejectMulti(data);
    }
}
