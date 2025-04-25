package com.boot.sound.admin.dao;

import org.apache.ibatis.annotations.Mapper;

import com.boot.sound.admin.dto.AdminDTO;
import com.boot.sound.admin.dto.AdminRequestDTO;

@Mapper
public interface AdminDAO {

	public AdminDTO login(String customerId);
	
	public String findPassword(String customerId);
	
	public void saveAdminRefreshToken(String customerId, String refresh_token);
	
	public String getRefreshToken(String customerId);
}
