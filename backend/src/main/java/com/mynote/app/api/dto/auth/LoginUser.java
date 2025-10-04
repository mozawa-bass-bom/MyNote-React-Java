package com.mynote.app.api.dto.auth;

import lombok.Data;

@Data
public class LoginUser {
	private Long userId;
	private String userName;
	private String password;
	private String role;
}
