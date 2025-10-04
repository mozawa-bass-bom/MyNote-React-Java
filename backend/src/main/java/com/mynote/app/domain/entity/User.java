package com.mynote.app.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class User {
	private Long id;
	private String userName;
	private String email;
	private LocalDateTime createdAt;
	private String role;
}