package com.boot.sound.transfer.multiAdmin;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/api/multiAdmin")
@RequiredArgsConstructor
public class MultiAdminController {

    private final MultiAdminService service;

    // 요청리스트
    @GetMapping("/approveList")
    public List<MultiAdminDTO> getApproveList() {
        return service.getApproveList();
    }

    // 요청건 세부 이체건 상세
    @GetMapping("/approveDetail/{transfer_id}")
    public List<MultiAdminDTO> getTransferDetails(@PathVariable int transfer_id) {
        return service.getTransferDetails(transfer_id);
    }

    // 요청승인
    @PostMapping("/approveMultiGroup")
    public void approveGroup(@RequestBody MultiAdminGroupRequest request) {
        service.approveMultiGroup(request.getCustomer_id(), request.getRequest_date());
    }

    // 요청거절
    @PostMapping("/rejectMultiGroup")
    public void rejectGroup(@RequestBody MultiAdminRejectRequest request) {
        service.rejectGroup(request.getCustomer_id(), request.getRequest_date(), request.getReason());
    }
}
