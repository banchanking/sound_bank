package com.boot.sound.jwt.config;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.RequiredArgsConstructor;



@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {  // 요청당 한번만 사용되기를 원하므로 OncePerRequestFilter 사용
	
	private final UserAuthProvider userAuthProvider;
	

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
	        throws ServletException, IOException {

	    System.out.println("<<< JwtAuthFilter - doFilterInternal() >>>");

	    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
	    String path = request.getRequestURI();
	    System.out.println(path);


	    // ✅ 2. Authorization 헤더가 정상적으로 있을 때만 검증
	    if (header != null && header.startsWith("Bearer ")) {
	        try {
	            String token = header.substring(7); // "Bearer " 다음부터 잘라냄
	            System.out.println("✅ 추출된 토큰: " + token);

	            SecurityContextHolder.getContext().setAuthentication(
	                    userAuthProvider.validationToken(token)
	            );
	        } catch (AuthenticationException e) {
	            System.out.println("❗ 인증 예외 발생: " + e.getMessage());
	            SecurityContextHolder.clearContext();
	        }
	    } else {
	        System.out.println("❗ Authorization 헤더가 없거나 Bearer 타입이 아님");
	    }

	    filterChain.doFilter(request, response);
	}


}
