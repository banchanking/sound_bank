package com.boot.sound.jwt.dto;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String customerId;
    private String role;

}

