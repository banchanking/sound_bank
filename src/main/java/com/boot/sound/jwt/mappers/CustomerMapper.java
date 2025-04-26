package com.boot.sound.jwt.mappers;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.boot.sound.customer.CustomerDTO;
import com.boot.sound.jwt.dto.CredentialsDTO;
import com.boot.sound.jwt.dto.SignUpDTO;

@Mapper
public interface CustomerMapper {
	
	CustomerDTO toCustomerDTO(CustomerDTO customer);
	CustomerDTO signUpToCustomer(SignUpDTO customerDTO);
	int saveRefreshToken(String customerId, String refresh_token);
	String selectRefreshToken(String customerId);
	CustomerDTO myInfoList(String customerId);
	Map<String, String>encodingInfo(String customerId);
	int updateMyInfo(CustomerDTO dto);
}
