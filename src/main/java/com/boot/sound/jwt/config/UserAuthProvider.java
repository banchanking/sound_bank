package com.boot.sound.jwt.config;

import java.util.Base64;
import java.util.Collections;
import java.util.Date;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;  // 경로주의(롬복 아님)
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;  // 경로주의
import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier; // 경로주의
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.customer.CustomerService;
import com.boot.sound.jwt.exception.CustomTokenExpiredException;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class UserAuthProvider {
	
	// JWT를 생성하고 읽으려면 비밀키가 필요하다.
	// 애플리케이션 yml 파일에서 구성하고 여기에 주입한다.
	// 그러나 JVM에서 기본값을 가질수도 있다.
	
	@Value("${security.jwt.token.secret-key:secret-value}")
	private String secretKey;
	
	private final CustomerService service;
	
//	private UserService userService;
//	
//	public UserAuthProvider(UserService userService) {
//		super();
//		this.userService = userService;
//	}

	@PostConstruct
	protected void init() {
		// 일단 텍스트로 된 비밀키를 피하기 위해 base64로 인코딩
		secretKey = Base64.getEncoder().encodeToString(secretKey.getBytes());
	}
	
	// Auth Token 생성
	public String createToken(String customerId) {
		System.out.println("<<< UserAuthProvider - createToken() >>>");
		
		Date now = new Date();  // java.util
		Date validity = new Date(now.getTime() + 1800000);   // 토큰 유효시간 1시간
		
		// JWT를 사용하려면 pom.xml에 java-jwt 추가
		return JWT.create()
				.withIssuer(customerId)
				.withIssuedAt(now)
				.withExpiresAt(validity)
				.sign(Algorithm.HMAC256(secretKey));
	}
	
	// Auth Token 검증
	public Authentication validationToken(String token) {
	    System.out.println("<<< UserAuthProvider - validationToken() >>>");
	    System.out.println("<<< UserAuthProvider - token >>>" + token);

	    try {
	        JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secretKey)).build();

	        System.out.println("<<< UserAuthProvider - validationToken() 1 >>>");

	        DecodedJWT decoded = verifier.verify(token); // ⛔ 만료되면 여기서 예외 발생

	        System.out.println("<<< UserAuthProvider - validationToken() 2 >>>");
	       
	        CustomerDTO user = service.findById(decoded.getIssuer());

	        return new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());

	    } catch (com.auth0.jwt.exceptions.TokenExpiredException e) {
	        System.out.println("⚠️ 토큰이 만료되었습니다: " + e.getMessage());
	        throw new CustomTokenExpiredException("토큰이 만료되었습니다.");
	    } catch (Exception e) {
	        System.out.println("❌ 토큰 검증 실패: " + e.getMessage());
	        // 인증 실패이므로 무조건 예외로 던지기
	        throw new CustomTokenExpiredException("유효하지 않은 토큰입니다.");
	    }
	}
	
	 // Refresh Token 발급
    public String createRefreshToken(String customer_id) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + 86400000); // 24시간

        return JWT.create()
                .withIssuer(customer_id)
                .withIssuedAt(now)
                .withExpiresAt(validity)
                .sign(Algorithm.HMAC256(secretKey));
    }

    // Refresh Token 검증
    public String validateRefreshToken(String refreshToken) {
        System.out.println("<<< UserAuthProvider - validateRefreshToken() >>>");
        System.out.println("<<< UserAuthProvider - refreshToken >>>" + refreshToken);

        try {
            // Refresh Token 검증
            JWTVerifier verifier = JWT.require(Algorithm.HMAC256(secretKey)).build();
            DecodedJWT decoded = verifier.verify(refreshToken);

            // Refresh Token에서 customerId 추출
            String customerId = decoded.getIssuer();

            // customerId 반환
            return customerId;
        } catch (JWTVerificationException e) {
            // Refresh Token 검증 실패 또는 만료
            System.out.println("<<< UserAuthProvider - validateRefreshToken() - JWTVerificationException >>>" + e.getMessage());
            throw new RuntimeException("Invalid refresh token", e);
        }
    }

}
