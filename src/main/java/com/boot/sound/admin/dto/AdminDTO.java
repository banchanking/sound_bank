package com.boot.sound.admin.dto;

import lombok.Data;

@Data
public class AdminDTO {

	private String customerID;
	private String password;
	private String name;
	private String role;
	private String refresh_token;
}
