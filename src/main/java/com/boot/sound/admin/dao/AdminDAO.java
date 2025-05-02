package com.boot.sound.admin.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.boot.sound.admin.dto.AdminDTO;
import com.boot.sound.admin.dto.AdminRequestDTO;
import com.boot.sound.customer.CustomerDTO;

@Mapper
public interface AdminDAO {

	public AdminDTO login(String customerId);
	
	public String findPassword(String customerId);
	
	public void saveAdminRefreshToken(String customerId, String refresh_token);
	
	public String getRefreshToken(String customerId);
	
	public Boolean insert(AdminDTO dto);
	
	public List<AdminDTO> adminList();
	
	public Boolean update(AdminDTO dto);
	
	public Boolean delete(AdminDTO dto);
	
	public Boolean logout(String customerId);
	
	public List<CustomerDTO> adminPageCustomerList();
}
