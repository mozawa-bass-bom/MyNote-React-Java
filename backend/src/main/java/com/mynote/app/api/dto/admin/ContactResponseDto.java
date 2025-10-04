package com.mynote.app.api.dto.admin;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ContactResponseDto {
	private Long id;
	private Long userId;
	private String userName;
	private String loginId;
	private String name;
	private String email;
	private String message;
	private LocalDateTime createdAt;
}
