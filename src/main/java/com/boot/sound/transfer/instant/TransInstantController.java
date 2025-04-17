package com.boot.sound.transfer.instant;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transInstant")
public class TransInstantController {

    private final TransInstantService service;

    public TransInstantController(TransInstantService service) {
        this.service = service;
    }

    // 실시간 이체
    @PostMapping("/send")
    public String send(@RequestBody TransInstantDTO dto) {
        return service.send(dto);
    }
}
