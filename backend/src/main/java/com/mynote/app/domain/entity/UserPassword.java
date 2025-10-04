package com.mynote.app.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserPassword {
	private Long userId;
	private String passwordHash;
	private LocalDateTime updatedAt;
}