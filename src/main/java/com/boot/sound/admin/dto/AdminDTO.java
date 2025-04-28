package com.boot.sound.admin.dto;

import java.sql.Date;

import lombok.Data;

@Data
public class AdminDTO {

	private String customerId;
	private String password;
	private String name;
	private String role;
	private String refresh_token;
	private Date created_at;
}
