package com.mynote.app.api.dto.note;

import lombok.Data;

@Data
public class NoteIndexRequestDto {
	private Long noteId;
	private Integer indexNumber;
	private Integer startIndex;
	private Integer endIndex;
	private String title;
	private String body;
}
