package com.boot.sound.jwt.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;  // 경로주의
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {
	
	// 방법1. 매개변수 생성자 => @RequiredArgsConstructor + final 매개변수
	private final UserAuthenticationEntryPoint userAuthenticationEntryPoint;
	private final UserAuthProvider userAuthProvider;
	
	
	// 방법2. 기본 방식 매개변수 생성자
	// private UserAuthenticationEntryPoint userAuthenticationEntryPoint;
	// private UserAuthProvider userAuthProvider;
	
//	public SecurityConfig(UserAuthenticationEntryPoint userAuthenticationEntryPoint,
//			UserAuthProvider userAuthProvider) {
//		super();
//		this.userAuthenticationEntryPoint = userAuthenticationEntryPoint;
//		this.userAuthProvider = userAuthProvider;
//	}

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		
		System.out.println("<<< SecurityConfig - securityFilterChain() >>>");
		
		http
			.exceptionHandling().authenticationEntryPoint(userAuthenticationEntryPoint) // 보안문제 발생시 사용자 지정메시지 반환
			.and()
			.addFilterBefore(new JwtAuthFilter(userAuthProvider), BasicAuthenticationFilter.class)  // Spring Security의 인증필터 앞에 JWT 필터를 추가
			.csrf().disable()  // 복잡성을 피하기 위해 csrf를 비활성화한다.
			.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)  // stateless 애플리케이션임을 스프링에게 전달하면 스프링에서 세션과 쿠키를 생성하지 않는다.
			.and()
			.authorizeHttpRequests((requests) -> requests
					.antMatchers(HttpMethod.GET, "/api/loanList","/api/loanCnt","/api/*","/api/exchange/*"
							,"/api/loanTypeSearch/","/api/loanTypeCnt/","/api/loanNameSearch/","/api/loanNameCnt/","/api/loanDetail/").permitAll() 
					.antMatchers(HttpMethod.POST, "/api/*", "/api/login.do","/api/refresh-token").permitAll()
					.anyRequest().authenticated()
					
		);			
		
		return http.build();
	}

}
