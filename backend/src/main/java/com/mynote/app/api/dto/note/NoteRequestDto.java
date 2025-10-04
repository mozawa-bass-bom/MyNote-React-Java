package com.mynote.app.api.dto.note;

import lombok.Data;

@Data
public class NoteRequestDto {


	private Long categoryId;
	private String title;
	private String description;
	private String originalFilename;

}
