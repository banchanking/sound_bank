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
        String customerId = request.getCustomerId();
        String role = request.getRole();

        System.out.println("💬 [refresh-token] customerId: " + customerId + ", role: " + role);

        try {
            String validatedCustomerId;

            if ("ADMIN".equalsIgnoreCase(role)) {
                validatedCustomerId = userAuthProvider.validateAdminRefreshToken(customerId);
            } else {
                validatedCustomerId = userAuthProvider.validateRefreshToken(customerId);
            }

            String newAccessToken = "ADMIN".equalsIgnoreCase(role)
                ? userAuthProvider.createAdminToken(customerId)
                : userAuthProvider.createToken(customerId);

            return ResponseEntity.ok().body(newAccessToken);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }
    }

}