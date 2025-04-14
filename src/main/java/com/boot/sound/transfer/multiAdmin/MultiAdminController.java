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

    @GetMapping("/approveList")
    public List<MultiAdminDTO> getApproveList() {
        return service.getApproveList();
    }

    @GetMapping("/approveDetail/{transfer_id}")
    public List<MultiAdminDTO> getTransferDetails(@PathVariable int transfer_id) {
        return service.getTransferDetails(transfer_id);
    }

    @PostMapping("/approveMultiGroup")
    public void approveGroup(@RequestBody MultiAdminGroupRequest request) {
        service.approveMultiGroup(request.getCustomer_id(), request.getRequest_date());
    }

    @PostMapping("/rejectMultiGroup")
    public void rejectGroup(@RequestBody MultiAdminRejectRequest request) {
        service.rejectGroup(request.getCustomer_id(), request.getRequest_date(), request.getReason());
    }
}
