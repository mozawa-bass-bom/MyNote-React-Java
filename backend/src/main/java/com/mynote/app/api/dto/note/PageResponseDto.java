package com.mynote.app.api.dto.note;

import lombok.Data;

@Data
public class PageResponseDto {
	private Long id;
	private Long noteId;
	private Integer pageNumber;
	private String firebasePublicUrl;
	private String firebaseAdminPath;
	private String extractedText;
}
