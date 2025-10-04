package com.mynote.app.api.dto.admin;

import java.time.LocalDateTime;

import lombok.Data;
@Data
public class AdminUserResponseDto {
	private Long id;
	private String userName;
	private String email;
	private LocalDateTime createdAt;
	private String role;
	private Long countCategories;
	private Long countNotes;
}
