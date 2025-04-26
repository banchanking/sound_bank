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
		
		 if (header != null) {
		        String[] elements = header.split(" ");
		        if (elements.length == 2 && "Bearer".equals(elements[0])) {
		            try {
		                SecurityContextHolder.getContext().setAuthentication(
		                        userAuthProvider.validationToken(elements[1])
		                );
		            } catch (AuthenticationException e) {
		                System.out.println("❗ 인증 예외 발생: " + e.getMessage());
		                SecurityContextHolder.clearContext();
		            }
		        }
		    }
		
		filterChain.doFilter(request, response); 
		
	}

}
