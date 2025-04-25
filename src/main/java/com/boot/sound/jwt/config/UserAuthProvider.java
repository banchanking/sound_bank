package com.boot.sound.jwt.config;

import java.util.Base64;
import java.util.Collections;
import java.util.Date;
import java.util.Optional;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;  // 경로주의(롬복 아님)
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;  // 경로주의
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier; // 경로주의
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.exceptions.TokenExpiredException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.boot.sound.admin.dao.AdminDAO;
import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.customer.CustomerService;
import com.boot.sound.jwt.exception.AppException;
import com.boot.sound.jwt.exception.CustomTokenExpiredException;
import com.boot.sound.jwt.mappers.CustomerMapper;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class UserAuthProvider {
	
	
	@Value("${security.jwt.token.secret-key:secret-value}")
	private String secretKey;
	
	private final CustomerService service;
	private final CustomerMapper mapper;
	private final AdminDAO adminDAO;
	

	@PostConstruct
	protected void init() {
		// 일단 텍스트로 된 비밀키를 피하기 위해 base64로 인코딩
		secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes());
	}
	
	// Auth Token 생성
	public String createToken(String customerId) {
		System.out.println("<<< UserAuthProvider - createToken() >>>");
		
		Date now = new Date();  // java.util
		Date validity = new Date(now.getTime() + 360000);   // 토큰 유효시간 1시간
		
		// JWT를 사용하려면 pom.xml에 java-jwt 추가
		return JWT.create()
				.withIssuer(customerId)
				.withClaim("role", "CUSTOMER")
				.withIssuedAt(now)
				.withExpiresAt(validity)
				.sign(Algorithm.HMAC256(secretKey));
	}
	
	// Auth Token 검증
	public Authentication validationToken(String token) {
	    System.out.println("<<< UserAuthProvider - validationToken() >>>");
	    System.out.println("<<< token: " + token + " >>>");

	    try {
	        // JWT 디코딩
	        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secretKey)).build();
	        DecodedJWT decoded = verifier.verify(token); // 만료되면 여기서 예외

	        String customerId = decoded.getIssuer(); // 토큰 발급자 = 로그인 ID
	        String role = decoded.getClaim("role").asString(); // role 클레임

	        System.out.println("✅ issuer (customerId): " + customerId);
	        System.out.println("✅ role: " + role);

	        Object user;

	        if ("ADMIN".equalsIgnoreCase(role)) {
	            user = Optional.ofNullable(adminDAO.login(customerId))
	                .orElseThrow(() -> new AppException("Unknown admin", HttpStatus.NOT_FOUND));
	        } else {
	            user = Optional.ofNullable(service.findById(customerId))
	                .orElseThrow(() -> new AppException("Unknown customer", HttpStatus.NOT_FOUND));
	        }

	        return new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());

	    } catch (TokenExpiredException e) {
	        System.out.println("⚠️ TokenExpiredException 발생: " + e.getMessage());
	        throw new CustomTokenExpiredException("토큰이 만료되었습니다.");
	    } catch (JWTVerificationException e) {
	        System.out.println("❗ JWTVerificationException 발생: " + e.getMessage());
	        throw new CustomTokenExpiredException("JWT 검증 실패");
	    }
	}

	
	// Admin Token 생성
		public String createAdminToken(String customerId ) {
			System.out.println("<<< UserAuthProvider - createToken() >>>");
			
			Date now = new Date();  // java.util
			Date validity = new Date(now.getTime() + 360);   // 토큰 유효시간 1시간
			
			// JWT를 사용하려면 pom.xml에 java-jwt 추가
			return JWT.create()
					.withIssuer(customerId)
					.withClaim("role", "ADMIN")
					.withIssuedAt(now)
					.withExpiresAt(validity)
					.sign(Algorithm.HMAC256(secretKey));
		}
	
	 // Refresh Token 발급
    public String createRefreshToken(String customer_id) {
    	System.out.println("<<< UserAuthProvider - createRefreshToken() >>>");
        Date now = new Date();
        Date validity = new Date(now.getTime() + 86400000); // 24시간

        return JWT.create()
                .withIssuer(customer_id)
                .withIssuedAt(now)
                .withExpiresAt(validity)
                .sign(Algorithm.HMAC256(secretKey));
    }

    // 고객 Refresh Token 검증
    public String validateRefreshToken(String customerId) {
        String refreshToken = mapper.selectRefreshToken(customerId);  // DB에서 꺼냄

        try {
            DecodedJWT decoded = JWT.require(Algorithm.HMAC256(secretKey)).build().verify(refreshToken);

            // 토큰 만료 여부 자동 검사됨
            if (!decoded.getIssuer().equals(customerId)) {
                throw new RuntimeException("토큰 발급자 불일치");
            }

            return createToken(customerId);  // 새 Access Token 발급
        } catch (JWTVerificationException e) {
            throw new RuntimeException("Refresh Token 유효하지 않음", e);
        }
    }
    
    // 관리자 Refresh Token 검증
    public String validateAdminRefreshToken(String customerId) {
        String savedToken = adminDAO.getRefreshToken(customerId);
        if (savedToken == null) throw new RuntimeException("No refresh token found");
        return customerId;
    }




}
