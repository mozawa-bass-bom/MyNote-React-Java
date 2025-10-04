package com.mynote.app.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Contact {
	private Long id;
	private Long userId;
	private String name;
	private String email;
	private String message;
	private LocalDateTime createdAt;
}