package com.mynote.app.api.dto.auth;

import lombok.Data;

@Data
public class RegisterUser {
	private String userName;
	private String password;
	private String email;
}
