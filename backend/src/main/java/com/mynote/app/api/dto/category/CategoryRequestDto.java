package com.mynote.app.api.dto.category;

import lombok.Data;

@Data
public class CategoryRequestDto {
	
	private String name;
	private String prompt1;
	private String prompt2;
}
