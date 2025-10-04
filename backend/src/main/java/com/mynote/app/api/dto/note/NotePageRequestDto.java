package com.mynote.app.api.dto.note;

import lombok.Data;

@Data
public class NotePageRequestDto {

	private Long noteId;
	private Integer pageNumber;
	private String firebasePublicUrl;
	private String firebaseAdminPath;
	private String extractedText;
}
