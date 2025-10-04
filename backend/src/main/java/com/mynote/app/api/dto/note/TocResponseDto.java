package com.mynote.app.api.dto.note;

import lombok.Data;

@Data
public class TocResponseDto {
	private Long id;
	private Long noteId;
	private Integer indexNumber;
	private Integer startIndex;
	private Integer endIndex;
	private String title;
	private String body;
}
