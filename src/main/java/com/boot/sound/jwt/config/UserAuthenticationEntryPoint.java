package com.boot.sound.jwt.config;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.boot.sound.jwt.dto.ErrorDTO;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class UserAuthenticationEntryPoint implements AuthenticationEntryPoint {

	
	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
	
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
	                     AuthenticationException authException) throws IOException, ServletException {

	    System.out.println("<<< UserAuthenticationEntryPoint - commence() >>>");

	    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
	    response.setContentType("application/json;charset=UTF-8"); 
	    response.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

	    OBJECT_MAPPER.writeValue(response.getOutputStream(),
	        new ErrorDTO("토큰이 만료되었거나 유효하지 않습니다."));
	}
			
			
			
	
}
