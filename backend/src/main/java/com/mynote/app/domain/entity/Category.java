package com.mynote.app.domain.entity;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Category {
	private Long id;
	private Long userId;
	private String name;
	private String prompt1;
	private String prompt2;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}