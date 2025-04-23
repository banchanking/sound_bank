package com.boot.sound.jwt.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.boot.sound.jwt.config.UserAuthProvider;
import com.boot.sound.jwt.dto.RefreshTokenRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class RefreshTokenController {

    private final UserAuthProvider userAuthProvider;

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        String customerId = request.getCustomerId();  // ✅ customerId만 받음
        System.out.println("💬 [refresh-token] 받은 customerId: " + customerId);
        try {
            // ✅ DB에서 직접 refreshToken을 꺼내서 검증
            String validatedCustomerId = userAuthProvider.validateRefreshToken(customerId);

            String newAccessToken = userAuthProvider.createToken(customerId);
            return ResponseEntity.ok(newAccessToken); // 단순 문자열 또는 {"accessToken": newAccessToken}
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }
    }

}