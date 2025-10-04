package com.mynote.app.api.dto.category;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CategoryResponseDto {
	private Long id;
	private Long userId;
	private String name;
	private String prompt1;
	private String prompt2;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
