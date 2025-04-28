package com.boot.sound.jwt.controller;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

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
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        try {
            String refreshToken = null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    System.out.println("쿠키 이름: " + cookie.getName() + ", 쿠키 값: " + cookie.getValue());
                    if ("refreshToken".equals(cookie.getName())) {
                        refreshToken = cookie.getValue();
                        break;
                    }
                }
            }

            System.out.println("최종 추출된 refreshToken: " + refreshToken);

            if (refreshToken == null) {
                throw new IllegalArgumentException("No refresh token found in cookies");
            }

            // ✅ 1. refreshToken 안에서 role 추출
            String role = userAuthProvider.extractRoleFromToken(refreshToken);
            System.out.println("추출된 Role: " + role);

            String customerId;

            // ✅ 2. 역할별 검증
            if ("ADMIN".equals(role)) {
                customerId = userAuthProvider.validateAdminRefreshToken(refreshToken);
            } else if ("CUSTOMER".equals(role)) {
                customerId = userAuthProvider.validateRefreshToken(refreshToken);
            } else {
                throw new IllegalArgumentException("Unknown role in token: " + role);
            }

            // ✅ 3. 역할별 AccessToken 발급
            String newAccessToken;
            if ("ADMIN".equals(role)) {
                newAccessToken = userAuthProvider.createAdminToken(customerId);
            } else {
                newAccessToken = userAuthProvider.createToken(customerId);
            }

            return ResponseEntity.ok(newAccessToken);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }
    }




}